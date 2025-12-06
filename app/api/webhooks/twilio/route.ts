import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { MessageChannel, MessageDirection, MessageStatus } from "@prisma/client";

/**
 * Twilio webhook handler for inbound messages and status updates
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const messageSid = formData.get("MessageSid") as string;
    const from = formData.get("From") as string;
    const to = formData.get("To") as string;
    const body = formData.get("Body") as string | null;
    const numMedia = parseInt((formData.get("NumMedia") as string) || "0");
    const messageStatus = formData.get("MessageStatus") as string | null;
    const messageType = formData.get("MessageType") as string | null;

    // Determine channel from phone number
    const isWhatsApp = from.includes("whatsapp:") || to.includes("whatsapp:");
    const channel: MessageChannel = isWhatsApp ? "WHATSAPP" : "SMS";

    // Extract phone number (remove whatsapp: prefix)
    const phoneNumber = from.replace("whatsapp:", "").replace("+", "");

    // Handle status updates
    if (messageStatus && messageSid) {
      const statusMap: Record<string, MessageStatus> = {
        queued: MessageStatus.PENDING,
        sent: MessageStatus.SENT,
        delivered: MessageStatus.DELIVERED,
        read: MessageStatus.READ,
        failed: MessageStatus.FAILED,
      };

      const status = statusMap[messageStatus] || MessageStatus.PENDING;

      await prisma.message.updateMany({
        where: { externalId: messageSid },
        data: {
          status,
          ...(status === MessageStatus.DELIVERED && { deliveredAt: new Date() }),
          ...(status === MessageStatus.READ && { readAt: new Date() }),
        },
      });

      return NextResponse.json({ success: true });
    }

    // Handle inbound messages
    if (!body && numMedia === 0) {
      return NextResponse.json({ success: true, message: "No content" });
    }

    // Find or create contact
    let contact = await prisma.contact.findUnique({
      where: { phoneNumber },
    });

    if (!contact) {
      contact = await prisma.contact.create({
        data: {
          phoneNumber,
        },
      });
    }

    // Get or create conversation
    let conversation = await prisma.conversation.findFirst({
      where: {
        contactId: contact.id,
        teamId: null, // For now, single team
      },
    });

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          contactId: contact.id,
          status: "OPEN",
        },
      });
    }

    // Collect media URLs
    const mediaUrls: string[] = [];
    if (numMedia > 0) {
      for (let i = 0; i < numMedia; i++) {
        const mediaUrl = formData.get(`MediaUrl${i}`) as string;
        if (mediaUrl) {
          mediaUrls.push(mediaUrl);
        }
      }
    }

    // Create message
    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        channel,
        direction: MessageDirection.INBOUND,
        body: body || null,
        mediaUrls,
        externalId: messageSid,
        status: MessageStatus.DELIVERED,
        sentAt: new Date(),
        deliveredAt: new Date(),
      },
    });

    // Update conversation
    await prisma.conversation.update({
      where: { id: conversation.id },
      data: {
        lastMessageAt: new Date(),
        unreadCount: { increment: 1 },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Twilio webhook error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
