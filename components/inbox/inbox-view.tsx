"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ThreadList } from "./thread-list";
import { ConversationView } from "./conversation-view";
import { ContactSidebar } from "./contact-sidebar";
import { ScheduledList } from "./scheduled-list";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
    id: string;
    channel: string;
    direction: string;
    body: string | null;
    createdAt: Date;
  }>;
}

async function fetchConversations(): Promise<Conversation[]> {
  const response = await fetch("/api/messages");
  if (!response.ok) {
    throw new Error("Failed to fetch conversations");
  }
  return response.json();
}

export function InboxView() {
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);

  const { data: conversations, isLoading } = useQuery({
    queryKey: ["conversations"],
    queryFn: fetchConversations,
    refetchInterval: 10000, // Poll every 10 seconds
  });

  const selectedConversation = conversations?.find(
    (c) => c.id === selectedConversationId
  );

  const handleSelectConversation = (conversationId: string, contactId: string) => {
    setSelectedConversationId(conversationId);
    setSelectedContactId(contactId);
  };

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="text-muted-foreground">Loading conversations...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 overflow-hidden">
      <div className="w-80 border-r flex flex-col">
        <Tabs defaultValue="conversations" className="flex flex-col h-full">
          <div className="border-b px-4 pt-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="conversations">Conversations</TabsTrigger>
              <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value="conversations" className="flex-1 m-0 mt-0 overflow-hidden">
            <ThreadList
              conversations={conversations || []}
              selectedConversationId={selectedConversationId}
              onSelectConversation={handleSelectConversation}
            />
          </TabsContent>
          <TabsContent value="scheduled" className="flex-1 m-0 mt-0 overflow-hidden">
            <ScheduledList />
          </TabsContent>
        </Tabs>
      </div>
      <div className="flex flex-1 flex-col overflow-hidden">
        {selectedConversation ? (
          <ConversationView
            conversation={selectedConversation}
            onContactSelect={setSelectedContactId}
          />
        ) : (
          <div className="flex flex-1 items-center justify-center text-muted-foreground">
            Select a conversation to view messages
          </div>
        )}
      </div>
      {selectedContactId && (
        <div className="w-80 border-l">
          <ContactSidebar contactId={selectedContactId} />
        </div>
      )}
    </div>
  );
}
