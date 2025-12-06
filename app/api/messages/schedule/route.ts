import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { MessageChannel } from "@prisma/client";
import { z } from "zod";

const scheduleMessageSchema = z.object({
  conversationId: z.string(),
  body: z.string().min(1),
  channel: z.enum(["SMS", "WHATSAPP"]),
  scheduledFor: z.string().datetime(),
  mediaUrls: z.array(z.string()).optional(),
});

/**
 * POST /api/messages/schedule - Schedule a message for later
 */
export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();
    const body = await request.json();
    const data = scheduleMessageSchema.parse(body);

    // Verify conversation exists
    const conversation = await prisma.conversation.findUnique({
      where: { id: data.conversationId },
    });

    if (!conversation) {
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 }
      );
    }

    const scheduledMessage = await prisma.scheduledMessage.create({
      data: {
        conversationId: data.conversationId,
        senderId: session.user.id,
        channel: data.channel as MessageChannel,
        body: data.body,
        mediaUrls: data.mediaUrls || [],
        scheduledFor: new Date(data.scheduledFor),
        status: "PENDING",
      },
    });

    return NextResponse.json(scheduledMessage);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: error.message || "Failed to schedule message" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/messages/schedule - Get all scheduled messages
 */
export async function GET(request: NextRequest) {
  try {
    await requireAuth();

    const scheduledMessages = await prisma.scheduledMessage.findMany({
      where: {
        status: "PENDING",
      },
      include: {
        conversation: {
          include: {
            contact: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                phoneNumber: true,
              },
            },
          },
        },
      },
      orderBy: { scheduledFor: "asc" },
    });

    return NextResponse.json(scheduledMessages);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch scheduled messages" },
      { status: 500 }
    );
  }
}
