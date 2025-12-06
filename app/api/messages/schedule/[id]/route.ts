import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";

/**
 * DELETE /api/messages/schedule/[id] - Cancel a scheduled message
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAuth();

    const scheduledMessage = await prisma.scheduledMessage.findUnique({
      where: { id: params.id },
    });

    if (!scheduledMessage) {
      return NextResponse.json(
        { error: "Scheduled message not found" },
        { status: 404 }
      );
    }

    if (scheduledMessage.senderId !== session.user.id) {
      return NextResponse.json(
        { error: "You can only cancel your own scheduled messages" },
        { status: 403 }
      );
    }

    await prisma.scheduledMessage.update({
      where: { id: params.id },
      data: { status: "CANCELLED" },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to cancel scheduled message" },
      { status: 500 }
    );
  }
}
