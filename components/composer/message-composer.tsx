"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Send, Calendar, Paperclip } from "lucide-react";
import { ScheduleDialog } from "./schedule-dialog";

interface MessageComposerProps {
  conversationId: string;
  onSend: (body: string, channel: string) => Promise<void>;
}

export function MessageComposer({ conversationId, onSend }: MessageComposerProps) {
  const [message, setMessage] = useState("");
  const [channel, setChannel] = useState<string>("SMS");
  const [isSending, setIsSending] = useState(false);
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);

  const handleSend = async () => {
    if (!message.trim()) return;

    setIsSending(true);
    try {
      await onSend(message, channel);
      setMessage("");
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Select value={channel} onValueChange={setChannel}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="SMS">SMS</SelectItem>
            <SelectItem value="WHATSAPP">WhatsApp</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex-1">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            rows={2}
            disabled={isSending}
            className="resize-none"
          />
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" disabled={isSending}>
            <Paperclip className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            disabled={isSending}
            onClick={() => setScheduleDialogOpen(true)}
            title="Schedule message"
          >
            <Calendar className="h-4 w-4" />
          </Button>
          <Button
            onClick={handleSend}
            disabled={!message.trim() || isSending}
            size="icon"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="text-xs text-muted-foreground">
        Press Enter to send, Shift+Enter for new line
      </div>
      <ScheduleDialog
        open={scheduleDialogOpen}
        onOpenChange={setScheduleDialogOpen}
        conversationId={conversationId}
        initialMessage={message}
        initialChannel={channel}
      />
    </div>
  );
}
