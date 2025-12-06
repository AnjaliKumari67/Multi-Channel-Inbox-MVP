"use client";

import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MessageSquare, Phone } from "lucide-react";

interface Conversation {
  id: string;
  contactId: string;
  contact: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    phoneNumber: string | null;
    email: string | null;
  };
  lastMessageAt: Date;
  unreadCount: number;
  status: string;
  messages: Array<{
    channel: string;
    direction: string;
    body: string | null;
    createdAt: Date;
  }>;
}

interface ThreadListProps {
  conversations: Conversation[];
  selectedConversationId: string | null;
  onSelectConversation: (conversationId: string, contactId: string) => void;
}

export function ThreadList({
  conversations,
  selectedConversationId,
  onSelectConversation,
}: ThreadListProps) {
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

  const getChannelBadgeVariant = (channel: string) => {
    switch (channel) {
      case "WHATSAPP":
        return "default";
      case "SMS":
        return "secondary";
      default:
        return "outline";
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="border-b p-4">
        <input
          type="text"
          placeholder="Search conversations..."
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        />
      </div>
      <div className="flex-1 overflow-y-auto">
        {conversations.length === 0 ? (
          <div className="flex h-full items-center justify-center p-4 text-sm text-muted-foreground">
            No conversations yet
          </div>
        ) : (
          <div className="divide-y">
            {conversations.map((conversation) => {
              const lastMessage = conversation.messages[conversation.messages.length - 1];
              const contactName =
                conversation.contact.firstName && conversation.contact.lastName
                  ? `${conversation.contact.firstName} ${conversation.contact.lastName}`
                  : conversation.contact.firstName ||
                    conversation.contact.email ||
                    conversation.contact.phoneNumber ||
                    "Unknown";
              const initials = contactName
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()
                .slice(0, 2);

              return (
                <button
                  key={conversation.id}
                  onClick={() =>
                    onSelectConversation(conversation.id, conversation.contactId)
                  }
                  className={cn(
                    "w-full px-4 py-3 text-left transition-colors hover:bg-accent",
                    selectedConversationId === conversation.id && "bg-accent"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>{initials}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="truncate font-medium">{contactName}</span>
                        {lastMessage && (
                          <span className="shrink-0 text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(lastMessage.createdAt), {
                              addSuffix: true,
                            })}
                          </span>
                        )}
                      </div>
                      <div className="mt-1 flex items-center gap-2">
                        {lastMessage && (
                          <>
                            <Badge
                              variant={getChannelBadgeVariant(lastMessage.channel)}
                              className="h-5 text-xs"
                            >
                              {getChannelIcon(lastMessage.channel)}
                              <span className="ml-1">{lastMessage.channel}</span>
                            </Badge>
                            <span className="truncate text-sm text-muted-foreground">
                              {lastMessage.body || "Media"}
                            </span>
                          </>
                        )}
                      </div>
                      {conversation.unreadCount > 0 && (
                        <div className="mt-1">
                          <Badge variant="default" className="h-5 text-xs">
                            {conversation.unreadCount} unread
                          </Badge>
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
