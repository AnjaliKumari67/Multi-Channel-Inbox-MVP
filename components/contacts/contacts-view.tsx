"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Mail, Phone } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

interface Contact {
  id: string;
  firstName: string | null;
  lastName: string | null;
  phoneNumber: string | null;
  email: string | null;
  company: string | null;
  createdAt: Date;
}

async function fetchContacts(search?: string): Promise<Contact[]> {
  const params = new URLSearchParams();
  if (search) params.set("search", search);
  const response = await fetch(`/api/contacts?${params}`);
  if (!response.ok) {
    throw new Error("Failed to fetch contacts");
  }
  const data = await response.json();
  return data.contacts || [];
}

async function createContact(data: {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  email?: string;
  company?: string;
}): Promise<Contact> {
  const response = await fetch("/api/contacts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error("Failed to create contact");
  }
  return response.json();
}

export function ContactsView() {
  const [search, setSearch] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: contacts, isLoading } = useQuery({
    queryKey: ["contacts", search],
    queryFn: () => fetchContacts(search),
  });

  const createMutation = useMutation({
    mutationFn: createContact,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
      setIsDialogOpen(false);
    },
  });

  const handleCreate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    createMutation.mutate({
      firstName: formData.get("firstName") as string,
      lastName: formData.get("lastName") as string,
      phoneNumber: formData.get("phoneNumber") as string,
      email: formData.get("email") as string,
      company: formData.get("company") as string,
    });
  };

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="text-muted-foreground">Loading contacts...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden p-6">
      <div className="mb-6 flex items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search contacts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Contact
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Contact</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input id="firstName" name="firstName" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input id="lastName" name="lastName" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <Input id="phoneNumber" name="phoneNumber" type="tel" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company">Company</Label>
                <Input id="company" name="company" />
              </div>
              <Button type="submit" className="w-full" disabled={createMutation.isPending}>
                {createMutation.isPending ? "Creating..." : "Create Contact"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {contacts && contacts.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {contacts.map((contact) => {
            const name =
              contact.firstName && contact.lastName
                ? `${contact.firstName} ${contact.lastName}`
                : contact.firstName ||
                  contact.email ||
                  contact.phoneNumber ||
                  "Unknown";
            const initials = name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase()
              .slice(0, 2);

            return (
              <Card key={contact.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback>{initials}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg truncate">{name}</CardTitle>
                      {contact.company && (
                        <CardDescription className="truncate">
                          {contact.company}
                        </CardDescription>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  {contact.phoneNumber && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{contact.phoneNumber}</span>
                    </div>
                  )}
                  {contact.email && (
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="truncate">{contact.email}</span>
                    </div>
                  )}
                  {!contact.phoneNumber && !contact.email && (
                    <div className="text-sm text-muted-foreground">
                      No contact information
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-1 items-center justify-center">
          <div className="text-center">
            <p className="text-muted-foreground">No contacts found</p>
            <Button
              className="mt-4"
              onClick={() => setIsDialogOpen(true)}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Your First Contact
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
