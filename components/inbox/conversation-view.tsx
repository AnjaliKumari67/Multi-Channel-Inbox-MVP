"use client";

import { format, formatDistanceToNow, isToday, isYesterday } from "date-fns";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MessageComposer } from "@/components/composer/message-composer";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Phone, MessageSquare } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Message {
  id: string;
  channel: string;
  direction: string;
  body: string | null;
  mediaUrls: string[];
  status: string;
  createdAt: Date;
  sender?: {
    name: string | null;
  };
}

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
}

interface ConversationViewProps {
  conversation: Conversation;
  onContactSelect: (contactId: string) => void;
}

async function fetchMessages(conversationId: string): Promise<Message[]> {
  const response = await fetch(`/api/messages/${conversationId}`);
  if (!response.ok) {
    throw new Error("Failed to fetch messages");
  }
  return response.json();
}

export function ConversationView({
  conversation,
  onContactSelect,
}: ConversationViewProps) {
  const queryClient = useQueryClient();
  const contactName =
    conversation.contact.firstName && conversation.contact.lastName
      ? `${conversation.contact.firstName} ${conversation.contact.lastName}`
      : conversation.contact.firstName ||
        conversation.contact.email ||
        conversation.contact.phoneNumber ||
        "Unknown";

  const { data: messages, isLoading } = useQuery({
    queryKey: ["messages", conversation.id],
    queryFn: () => fetchMessages(conversation.id),
    refetchInterval: 5000, // Poll every 5 seconds
  });

  const groupMessagesByDate = (messages: Message[]) => {
    const groups: { [key: string]: Message[] } = {};
    messages.forEach((msg) => {
      const date = new Date(msg.createdAt);
      let key: string;
      if (isToday(date)) {
        key = "Today";
      } else if (isYesterday(date)) {
        key = "Yesterday";
      } else {
        key = format(date, "MMMM d, yyyy");
      }
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(msg);
    });
    return groups;
  };

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

  const handleSendMessage = async (body: string, channel: string) => {
    const response = await fetch("/api/messages/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        conversationId: conversation.id,
        body,
        channel,
      }),
    });

    if (response.ok) {
      queryClient.invalidateQueries({ queryKey: ["messages", conversation.id] });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="text-muted-foreground">Loading messages...</div>
      </div>
    );
  }

  const messageGroups = messages ? groupMessagesByDate(messages) : {};

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="flex items-center gap-3 border-b bg-card px-6 py-4">
        <button onClick={() => onContactSelect(conversation.contactId)}>
          <Avatar className="h-10 w-10">
            <AvatarFallback>
              {contactName
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()
                .slice(0, 2)}
            </AvatarFallback>
          </Avatar>
        </button>
        <div className="flex-1">
          <div className="font-medium">{contactName}</div>
          <div className="text-sm text-muted-foreground">
            {conversation.contact.phoneNumber || conversation.contact.email}
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-6 space-y-6">
          {Object.entries(messageGroups).map(([date, dateMessages]) => (
            <div key={date}>
              <div className="mb-4 text-center">
                <span className="text-xs font-medium text-muted-foreground">
                  {date}
                </span>
              </div>
              <div className="space-y-4">
                {dateMessages.map((message) => {
                  const isOutbound = message.direction === "OUTBOUND";
                  return (
                    <div
                      key={message.id}
                      className={`flex gap-3 ${
                        isOutbound ? "justify-end" : "justify-start"
                      }`}
                    >
                      {!isOutbound && (
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>
                            {contactName
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .toUpperCase()
                              .slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                      )}
                      <div
                        className={`flex max-w-[70%] flex-col gap-1 ${
                          isOutbound ? "items-end" : "items-start"
                        }`}
                      >
                        <div
                          className={`rounded-lg px-4 py-2 ${
                            isOutbound
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted"
                          }`}
                        >
                          <div className="mb-1 flex items-center gap-2">
                            <Badge
                              variant={
                                message.channel === "WHATSAPP"
                                  ? "default"
                                  : "secondary"
                              }
                              className="h-4 text-xs"
                            >
                              {getChannelIcon(message.channel)}
                              <span className="ml-1">{message.channel}</span>
                            </Badge>
                          </div>
                          {message.body && <div>{message.body}</div>}
                          {message.mediaUrls.length > 0 && (
                            <div className="mt-2 space-y-2">
                              {message.mediaUrls.map((url, idx) => (
                                <img
                                  key={idx}
                                  src={url}
                                  alt="Media"
                                  className="max-w-full rounded"
                                />
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>
                            {format(new Date(message.createdAt), "h:mm a")}
                          </span>
                          {isOutbound && message.status === "DELIVERED" && (
                            <span>✓✓</span>
                          )}
                          {isOutbound && message.status === "READ" && (
                            <span className="text-blue-500">✓✓</span>
                          )}
                        </div>
                      </div>
                      {isOutbound && (
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>You</AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
          {messages && messages.length === 0 && (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              No messages yet. Start the conversation!
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="border-t bg-card p-4">
        <MessageComposer
          conversationId={conversation.id}
          onSend={handleSendMessage}
        />
      </div>
    </div>
  );
}
