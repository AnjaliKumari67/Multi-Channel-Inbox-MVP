import { getCurrentUser } from "@/lib/auth-helpers";
import { InboxView } from "@/components/inbox/inbox-view";

export default async function InboxPage() {
  const user = await getCurrentUser();

  if (!user) {
    return null;
  }

  return (
    <div className="flex h-screen flex-col">
      <div className="border-b bg-card px-6 py-4">
        <h1 className="text-2xl font-semibold">Inbox</h1>
        <p className="text-sm text-muted-foreground">
          Unified messages from all channels
        </p>
      </div>
      <InboxView />
    </div>
  );
}
