"use client";

import { format, formatDistanceToNow } from "date-fns";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Phone, MessageSquare, X, Calendar } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ScheduledMessage {
  id: string;
  conversationId: string;
  channel: string;
  body: string | null;
  scheduledFor: Date;
  status: string;
  conversation: {
    contact: {
      firstName: string | null;
      lastName: string | null;
      phoneNumber: string | null;
    };
  };
}

async function fetchScheduledMessages(): Promise<ScheduledMessage[]> {
  const response = await fetch("/api/messages/schedule");
  if (!response.ok) {
    throw new Error("Failed to fetch scheduled messages");
  }
  return response.json();
}

export function ScheduledList() {
  const queryClient = useQueryClient();

  const { data: scheduledMessages, isLoading } = useQuery({
    queryKey: ["scheduled-messages"],
    queryFn: fetchScheduledMessages,
    refetchInterval: 10000, // Refetch every 10 seconds
  });

  const cancelMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/messages/schedule/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to cancel message");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["scheduled-messages"] });
    },
  });

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case "SMS":
        return <Phone className="h-3 w-3" />;
      case "WHATSAPP":
        return <MessageSquare className="h-3 w-3" />;
      default:
        return <MessageSquare className="h-3 w-3" />;
    }
  };

  const getInitials = (firstName: string | null, lastName: string | null) => {
    const first = firstName?.charAt(0).toUpperCase() || "";
    const last = lastName?.charAt(0).toUpperCase() || "";
    return first + last || "?";
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <p className="text-sm text-muted-foreground">Loading scheduled messages...</p>
      </div>
    );
  }

  if (!scheduledMessages || scheduledMessages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-sm font-medium">No scheduled messages</p>
        <p className="text-xs text-muted-foreground mt-1">
          Schedule messages from the conversation view
        </p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="space-y-2 p-2">
        {scheduledMessages.map((scheduled) => {
          const contactName =
            scheduled.conversation.contact.firstName &&
            scheduled.conversation.contact.lastName
              ? `${scheduled.conversation.contact.firstName} ${scheduled.conversation.contact.lastName}`
              : scheduled.conversation.contact.firstName ||
                scheduled.conversation.contact.phoneNumber ||
                "Unknown";

          const scheduledDate = new Date(scheduled.scheduledFor);
          const isPast = scheduledDate < new Date();

          return (
            <div
              key={scheduled.id}
              className="group relative rounded-lg border bg-card p-3 hover:bg-accent/50 transition-colors"
            >
              <div className="flex items-start gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback>
                    {getInitials(
                      scheduled.conversation.contact.firstName,
                      scheduled.conversation.contact.lastName
                    )}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <p className="text-sm font-medium truncate">{contactName}</p>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => cancelMutation.mutate(scheduled.id)}
                      disabled={cancelMutation.isPending}
                      title="Cancel scheduled message"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className="text-xs">
                      {getChannelIcon(scheduled.channel)}
                      <span className="ml-1">{scheduled.channel}</span>
                    </Badge>
                    {isPast && (
                      <Badge variant="secondary" className="text-xs">
                        Overdue
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                    {scheduled.body || "No message body"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {format(scheduledDate, "PPP 'at' p")}
                    {!isPast && (
                      <span className="ml-2">
                        ({formatDistanceToNow(scheduledDate, { addSuffix: true })})
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
}
