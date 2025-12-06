"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Phone, CheckCircle2 } from "lucide-react";

export function SettingsView() {
  const twilioPhoneNumber = process.env.NEXT_PUBLIC_TWILIO_PHONE_NUMBER || "";
  const twilioAccountSid = process.env.NEXT_PUBLIC_TWILIO_ACCOUNT_SID || "";
  const isConnected = !!twilioAccountSid;

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      {/* Twilio Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Twilio Integration</CardTitle>
          <CardDescription>
            Configure your Twilio account for SMS and WhatsApp messaging
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Phone className="h-5 w-5 text-muted-foreground" />
              <span className="font-medium">Status</span>
            </div>
            {isConnected ? (
              <Badge variant="default" className="gap-2">
                <CheckCircle2 className="h-3 w-3" />
                Connected
              </Badge>
            ) : (
              <Badge variant="secondary">Not Connected</Badge>
            )}
          </div>

          {isConnected && (
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium">Phone Number</label>
                <div className="rounded-md border bg-muted px-3 py-2 text-sm">
                  {twilioPhoneNumber}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Account SID</label>
                <div className="rounded-md border bg-muted px-3 py-2 text-sm font-mono">
                  {twilioAccountSid}
                </div>
              </div>

              <div className="rounded-md bg-muted p-4">
                <h4 className="font-medium mb-2">WhatsApp Sandbox</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  To test WhatsApp messages, join the sandbox by sending this code:
                </p>
                <div className="rounded-md border bg-background px-3 py-2 text-sm font-mono">
                  join [your-sandbox-code]
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Send this message to +1 415 523 8886 from your WhatsApp
                </p>
              </div>

              <div className="rounded-md bg-blue-50 dark:bg-blue-950 p-4">
                <h4 className="font-medium mb-2">Webhook URL</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  Configure this URL in your Twilio console for message status updates:
                </p>
                <div className="rounded-md border bg-background px-3 py-2 text-sm font-mono break-all">
                  {typeof window !== "undefined"
                    ? `${window.location.origin}/api/webhooks/twilio`
                    : "http://localhost:3000/api/webhooks/twilio"}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* User Preferences */}
      <Card>
        <CardHeader>
          <CardTitle>Preferences</CardTitle>
          <CardDescription>
            Manage your account preferences
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            User preferences coming soon...
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
