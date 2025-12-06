import twilio from "twilio";
import type { ChannelSender, SendResult } from "./types";

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER || "";
const WHATSAPP_SANDBOX_NUMBER = process.env.TWILIO_WHATSAPP_SANDBOX_NUMBER || "";

/**
 * Twilio SMS sender
 */
export class TwilioSMSSender implements ChannelSender {
  async send(
    to: string,
    body: string,
    options?: { mediaUrls?: string[]; from?: string }
  ): Promise<SendResult> {
    try {
      const message = await client.messages.create({
        body,
        from: options?.from || TWILIO_PHONE_NUMBER,
        to: to.startsWith("+") ? to : `+${to}`,
        mediaUrl: options?.mediaUrls,
      });

      return {
        success: true,
        messageId: message.sid,
        externalId: message.sid,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || "Failed to send SMS",
      };
    }
  }
}

/**
 * Twilio WhatsApp sender (Sandbox mode)
 */
export class TwilioWhatsAppSender implements ChannelSender {
  async send(
    to: string,
    body: string,
    options?: { mediaUrls?: string[]; from?: string }
  ): Promise<SendResult> {
    try {
      // Format number for WhatsApp
      const formattedTo = to.startsWith("whatsapp:") 
        ? to 
        : to.startsWith("+")
        ? `whatsapp:${to}`
        : `whatsapp:+${to}`;

      const message = await client.messages.create({
        body,
        from: options?.from || WHATSAPP_SANDBOX_NUMBER,
        to: formattedTo,
        mediaUrl: options?.mediaUrls,
      });

      return {
        success: true,
        messageId: message.sid,
        externalId: message.sid,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || "Failed to send WhatsApp message",
      };
    }
  }
}

/**
 * Factory function to create channel senders
 */
export function createChannelSender(channel: "SMS" | "WHATSAPP"): ChannelSender {
  switch (channel) {
    case "SMS":
      return new TwilioSMSSender();
    case "WHATSAPP":
      return new TwilioWhatsAppSender();
    default:
      throw new Error(`Unsupported channel: ${channel}`);
  }
}
