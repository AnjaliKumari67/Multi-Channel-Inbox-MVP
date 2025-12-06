import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { createChannelSender } from "@/lib/integrations";
import { MessageChannel, MessageDirection, MessageStatus } from "@prisma/client";
import { z } from "zod";

const sendMessageSchema = z.object({
  conversationId: z.string(),
  body: z.string().min(1),
  channel: z.enum(["SMS", "WHATSAPP"]),
  mediaUrls: z.array(z.string()).optional(),
});

/**
 * POST /api/messages/send - Send a message via Twilio
 */
export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();
    const body = await request.json();
    const data = sendMessageSchema.parse(body);

    // Get conversation and contact
    const conversation = await prisma.conversation.findUnique({
      where: { id: data.conversationId },
      include: { contact: true },
    });

    if (!conversation) {
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 }
      );
    }

    const contact = conversation.contact;
    if (!contact.phoneNumber) {
      return NextResponse.json(
        { error: "Contact has no phone number" },
        { status: 400 }
      );
    }

    // Create channel sender
    const sender = createChannelSender(data.channel);

    // Send message via Twilio
    const result = await sender.send(contact.phoneNumber, data.body, {
      mediaUrls: data.mediaUrls,
    });

    if (!result.success) {
      // Create failed message record
      await prisma.message.create({
        data: {
          conversationId: conversation.id,
          senderId: session.user.id,
          channel: data.channel as MessageChannel,
          direction: MessageDirection.OUTBOUND,
          body: data.body,
          mediaUrls: data.mediaUrls || [],
          status: MessageStatus.FAILED,
          errorMessage: result.error,
          sentAt: new Date(),
        },
      });

      return NextResponse.json(
        { error: result.error || "Failed to send message" },
        { status: 500 }
      );
    }

    // Create message record
    const message = await prisma.message.create({
      data: {
        conversationId: conversation.id,
        senderId: session.user.id,
        channel: data.channel as MessageChannel,
        direction: MessageDirection.OUTBOUND,
        body: data.body,
        mediaUrls: data.mediaUrls || [],
        externalId: result.externalId,
        status: MessageStatus.SENT,
        sentAt: new Date(),
      },
    });

    // Update conversation
    await prisma.conversation.update({
      where: { id: conversation.id },
      data: {
        lastMessageAt: new Date(),
        unreadCount: 0, // Clear unread count when sending
      },
    });

    return NextResponse.json(message);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: error.message || "Failed to send message" },
      { status: 500 }
    );
  }
}
