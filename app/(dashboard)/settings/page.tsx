import { getCurrentUser } from "@/lib/auth-helpers";
import { SettingsView } from "@/components/settings/settings-view";

export default async function SettingsPage() {
  const user = await getCurrentUser();

  if (!user) {
    return null;
  }

  return (
    <div className="flex h-screen flex-col">
      <div className="border-b bg-card px-6 py-4">
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Manage your account and integrations
        </p>
      </div>
      <SettingsView />
    </div>
  );
}
