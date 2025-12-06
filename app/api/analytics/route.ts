import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { format, subDays } from "date-fns";

/**
 * GET /api/analytics - Get analytics data
 */
export async function GET(request: NextRequest) {
  try {
    await requireAuth();

    // Get totals
    const [totalMessages, totalContacts, totalConversations] = await Promise.all([
      prisma.message.count(),
      prisma.contact.count(),
      prisma.conversation.count(),
    ]);

    // Get messages by channel
    const messagesByChannelRaw = await prisma.message.groupBy({
      by: ["channel"],
      _count: {
        id: true,
      },
    });

    const messagesByChannel = messagesByChannelRaw.map((item) => ({
      channel: item.channel,
      count: item._count.id,
    }));

    // Get messages by date (last 7 days)
    const sevenDaysAgo = subDays(new Date(), 7);
    const messagesByDateRaw = await prisma.message.groupBy({
      by: ["createdAt"],
      where: {
        createdAt: {
          gte: sevenDaysAgo,
        },
      },
      _count: {
        id: true,
      },
    });

    // Group by day
    const messagesByDay: { [key: string]: number } = {};
    messagesByDateRaw.forEach((item) => {
      const date = format(new Date(item.createdAt), "yyyy-MM-dd");
      messagesByDay[date] = (messagesByDay[date] || 0) + item._count.id;
    });

    // Fill in missing days
    const messagesByDate = [];
    for (let i = 6; i >= 0; i--) {
      const date = format(subDays(new Date(), i), "yyyy-MM-dd");
      messagesByDate.push({
        date: format(subDays(new Date(), i), "MMM d"),
        count: messagesByDay[date] || 0,
      });
    }

    // Calculate average response time (simplified)
    const conversations = await prisma.conversation.findMany({
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
        },
      },
    });

    let totalResponseTime = 0;
    let responseCount = 0;

    conversations.forEach((conv) => {
      const messages = conv.messages;
      if (messages.length < 2) return;

      // Find time between inbound and outbound messages
      for (let i = 1; i < messages.length; i++) {
        const prev = messages[i - 1];
        const curr = messages[i];

        if (
          prev.direction === "INBOUND" &&
          curr.direction === "OUTBOUND"
        ) {
          const responseTime =
            new Date(curr.createdAt).getTime() -
            new Date(prev.createdAt).getTime();
          totalResponseTime += responseTime;
          responseCount++;
        }
      }
    });

    const averageResponseTime =
      responseCount > 0 ? totalResponseTime / responseCount : 0;

    return NextResponse.json({
      totalMessages,
      totalContacts,
      totalConversations,
      averageResponseTime,
      messagesByChannel,
      messagesByDate,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}
