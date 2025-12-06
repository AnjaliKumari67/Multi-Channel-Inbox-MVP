import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createChannelSender } from "@/lib/integrations";
import { MessageChannel, MessageDirection, MessageStatus } from "@prisma/client";

/**
 * Process scheduled messages that are due
 * This should be called by a cron job (e.g., Vercel Cron)
 */
export async function GET(request: NextRequest) {
  // Verify cron secret (optional, for security)
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const now = new Date();

    // Get all pending scheduled messages that are due
    const scheduledMessages = await prisma.scheduledMessage.findMany({
      where: {
        status: "PENDING",
        scheduledFor: {
          lte: now,
        },
      },
      include: {
        conversation: {
          include: {
            contact: true,
          },
        },
      },
    });

    const results = [];

    for (const scheduled of scheduledMessages) {
      try {
        const contact = scheduled.conversation.contact;
        if (!contact.phoneNumber) {
          await prisma.scheduledMessage.update({
            where: { id: scheduled.id },
            data: { status: "CANCELLED" },
          });
          results.push({
            id: scheduled.id,
            status: "skipped",
            reason: "No phone number",
          });
          continue;
        }

        // Send message via Twilio
        const sender = createChannelSender(scheduled.channel as "SMS" | "WHATSAPP");
        const result = await sender.send(
          contact.phoneNumber,
          scheduled.body || "",
          {
            mediaUrls: scheduled.mediaUrls,
          }
        );

        if (result.success) {
          // Create message record
          await prisma.message.create({
            data: {
              conversationId: scheduled.conversationId,
              senderId: scheduled.senderId,
              channel: scheduled.channel as MessageChannel,
              direction: MessageDirection.OUTBOUND,
              body: scheduled.body || null,
              mediaUrls: scheduled.mediaUrls,
              externalId: result.externalId,
              status: MessageStatus.SENT,
              sentAt: new Date(),
            },
          });

          // Update conversation
          await prisma.conversation.update({
            where: { id: scheduled.conversationId },
            data: {
              lastMessageAt: new Date(),
            },
          });

          // Mark as sent
          await prisma.scheduledMessage.update({
            where: { id: scheduled.id },
            data: { status: "SENT" },
          });

          results.push({
            id: scheduled.id,
            status: "sent",
          });
        } else {
          // Mark as failed (or keep as pending for retry)
          results.push({
            id: scheduled.id,
            status: "failed",
            error: result.error,
          });
        }
      } catch (error: any) {
        results.push({
          id: scheduled.id,
          status: "error",
          error: error.message,
        });
      }
    }

    return NextResponse.json({
      processed: results.length,
      results,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to process scheduled messages" },
      { status: 500 }
    );
  }
}
