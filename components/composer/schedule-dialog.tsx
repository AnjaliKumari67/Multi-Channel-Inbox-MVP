"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface ScheduleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  conversationId: string;
  initialMessage?: string;
  initialChannel?: string;
}

export function ScheduleDialog({
  open,
  onOpenChange,
  conversationId,
  initialMessage = "",
  initialChannel = "SMS",
}: ScheduleDialogProps) {
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [time, setTime] = useState("");
  const [channel, setChannel] = useState(initialChannel);
  const [message, setMessage] = useState(initialMessage);
  const queryClient = useQueryClient();

  const scheduleMutation = useMutation({
    mutationFn: async (data: {
      conversationId: string;
      body: string;
      channel: string;
      scheduledFor: string;
    }) => {
      const response = await fetch("/api/messages/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to schedule message");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["scheduled-messages"] });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      onOpenChange(false);
      setDate(undefined);
      setTime("");
      setMessage("");
    },
  });

  const handleSchedule = () => {
    if (!date || !time || !message.trim()) return;

    // Combine date and time
    const [hours, minutes] = time.split(":").map(Number);
    const scheduledDate = new Date(date);
    scheduledDate.setHours(hours, minutes, 0, 0);

    // Validate date is in the future
    if (scheduledDate <= new Date()) {
      alert("Please select a future date and time");
      return;
    }

    // Convert to ISO string for API
    const scheduledFor = scheduledDate.toISOString();

    scheduleMutation.mutate({
      conversationId,
      body: message,
      channel,
      scheduledFor,
    });
  };

  const isValid = date && time && message.trim();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Schedule Message</DialogTitle>
          <DialogDescription>
            Choose when to send this message to the contact
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Channel Selection */}
          <div className="space-y-2">
            <Label htmlFor="channel">Channel</Label>
            <Select value={channel} onValueChange={setChannel}>
              <SelectTrigger id="channel">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="SMS">SMS</SelectItem>
                <SelectItem value="WHATSAPP">WhatsApp</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Message Preview */}
          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message..."
              rows={4}
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          {/* Date Selection */}
          <div className="space-y-2">
            <Label>Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  disabled={(date) => {
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    const compareDate = new Date(date);
                    compareDate.setHours(0, 0, 0, 0);
                    return compareDate < today;
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Time Selection */}
          <div className="space-y-2">
            <Label htmlFor="time">Time</Label>
            <Input
              id="time"
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full"
            />
          </div>

          {/* Preview Scheduled Date/Time */}
          {date && time && (
            <div className="rounded-md bg-muted p-3">
              <p className="text-sm font-medium">Scheduled for:</p>
              <p className="text-sm text-muted-foreground">
                {(() => {
                  const [hours, minutes] = time.split(":").map(Number);
                  const scheduledDate = new Date(date);
                  scheduledDate.setHours(hours, minutes, 0, 0);
                  return format(scheduledDate, "PPP 'at' p");
                })()}
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSchedule}
            disabled={!isValid || scheduleMutation.isPending}
          >
            {scheduleMutation.isPending ? "Scheduling..." : "Schedule"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
