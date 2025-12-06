import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/messages - Fetch all conversation threads
 */
export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth();

    const conversations = await prisma.conversation.findMany({
      where: {
        // For now, show all conversations (multi-tenant later)
      },
      include: {
        contact: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phoneNumber: true,
            email: true,
          },
        },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: {
            id: true,
            channel: true,
            direction: true,
            body: true,
            createdAt: true,
          },
        },
      },
      orderBy: { lastMessageAt: "desc" },
      take: 100, // Limit for now
    });

    return NextResponse.json(conversations);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch conversations" },
      { status: 500 }
    );
  }
}
