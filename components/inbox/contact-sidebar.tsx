"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Phone, Mail, User } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Contact {
  id: string;
  firstName: string | null;
  lastName: string | null;
  phoneNumber: string | null;
  email: string | null;
  company: string | null;
  notes: string | null;
  createdAt: Date;
}

interface Note {
  id: string;
  content: string;
  isPrivate: boolean;
  createdAt: Date;
  user: {
    name: string | null;
  };
}

async function fetchContact(contactId: string): Promise<Contact> {
  const response = await fetch(`/api/contacts/${contactId}`);
  if (!response.ok) {
    throw new Error("Failed to fetch contact");
  }
  return response.json();
}

async function fetchContactNotes(contactId: string): Promise<Note[]> {
  const response = await fetch(`/api/contacts/${contactId}/notes`);
  if (!response.ok) {
    throw new Error("Failed to fetch notes");
  }
  return response.json();
}

async function createNote(contactId: string, content: string, isPrivate: boolean): Promise<Note> {
  const response = await fetch(`/api/contacts/${contactId}/notes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content, isPrivate }),
  });
  if (!response.ok) {
    throw new Error("Failed to create note");
  }
  return response.json();
}

interface ContactSidebarProps {
  contactId: string;
}

export function ContactSidebar({ contactId }: ContactSidebarProps) {
  const [noteContent, setNoteContent] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const queryClient = useQueryClient();

  const { data: contact, isLoading: contactLoading } = useQuery({
    queryKey: ["contact", contactId],
    queryFn: () => fetchContact(contactId),
  });

  const { data: notes, isLoading: notesLoading } = useQuery({
    queryKey: ["notes", contactId],
    queryFn: () => fetchContactNotes(contactId),
  });

  const createNoteMutation = useMutation({
    mutationFn: (data: { content: string; isPrivate: boolean }) =>
      createNote(contactId, data.content, data.isPrivate),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes", contactId] });
      setNoteContent("");
      setIsPrivate(false);
    },
  });

  const handleSubmitNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteContent.trim()) return;
    createNoteMutation.mutate({ content: noteContent, isPrivate });
  };

  if (contactLoading) {
    return (
      <div className="flex h-full items-center justify-center p-4">
        <div className="text-muted-foreground">Loading contact...</div>
      </div>
    );
  }

  if (!contact) {
    return (
      <div className="flex h-full items-center justify-center p-4">
        <div className="text-muted-foreground">Contact not found</div>
      </div>
    );
  }

  const contactName =
    contact.firstName && contact.lastName
      ? `${contact.firstName} ${contact.lastName}`
      : contact.firstName ||
        contact.email ||
        contact.phoneNumber ||
        "Unknown";
  const initials = contactName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="flex h-full flex-col overflow-y-auto bg-card">
      <ScrollArea className="flex-1">
        <div className="p-6 space-y-6">
          {/* Contact Header */}
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="text-lg">{initials}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h2 className="text-lg font-semibold">{contactName}</h2>
              {contact.company && (
                <p className="text-sm text-muted-foreground">{contact.company}</p>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex gap-2">
            {contact.phoneNumber && (
              <Button variant="outline" size="sm" className="flex-1">
                <Phone className="mr-2 h-4 w-4" />
                Call
              </Button>
            )}
            {contact.email && (
              <Button variant="outline" size="sm" className="flex-1">
                <Mail className="mr-2 h-4 w-4" />
                Email
              </Button>
            )}
          </div>

          {/* Contact Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {contact.phoneNumber && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{contact.phoneNumber}</span>
                </div>
              )}
              {contact.email && (
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{contact.email}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <User className="h-4 w-4" />
                <span>Added {format(new Date(contact.createdAt), "MMM d, yyyy")}</span>
              </div>
            </CardContent>
          </Card>

          {/* Notes Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Notes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleSubmitNote} className="space-y-3">
                <Textarea
                  placeholder="Add a note about this contact..."
                  rows={3}
                  className="resize-none"
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  disabled={createNoteMutation.isPending}
                />
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isPrivate"
                    checked={isPrivate}
                    onChange={(e) => setIsPrivate(e.target.checked)}
                    className="rounded border-input"
                  />
                  <label htmlFor="isPrivate" className="text-sm text-muted-foreground">
                    Private (only visible to me)
                  </label>
                </div>
                <Button
                  type="submit"
                  size="sm"
                  className="w-full"
                  disabled={!noteContent.trim() || createNoteMutation.isPending}
                >
                  {createNoteMutation.isPending ? "Adding..." : "Add Note"}
                </Button>
              </form>

              {notesLoading ? (
                <div className="text-sm text-muted-foreground">Loading notes...</div>
              ) : notes && notes.length > 0 ? (
                <div className="space-y-3">
                  {notes.map((note) => (
                    <div key={note.id} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium">
                          {note.user.name || "Unknown"}
                        </span>
                        {note.isPrivate && (
                          <Badge variant="secondary" className="h-4 text-xs">
                            Private
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{note.content}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(note.createdAt), "MMM d, yyyy 'at' h:mm a")}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">No notes yet</div>
              )}
            </CardContent>
          </Card>
        </div>
      </ScrollArea>
    </div>
  );
}
