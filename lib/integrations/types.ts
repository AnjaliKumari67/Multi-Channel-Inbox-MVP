/**
 * Unified channel sender interface
 */
export interface ChannelSender {
  send(
    to: string,
    body: string,
    options?: SendOptions
  ): Promise<SendResult>;
}

export interface SendOptions {
  mediaUrls?: string[];
  from?: string;
}

export interface SendResult {
  success: boolean;
  messageId?: string;
  externalId?: string;
  error?: string;
}

export type MessageChannel = "SMS" | "WHATSAPP" | "EMAIL" | "TWITTER" | "FACEBOOK";
