import { getCurrentUser } from "@/lib/auth-helpers";
import { AnalyticsView } from "@/components/analytics/analytics-view";

export default async function AnalyticsPage() {
  const user = await getCurrentUser();

  if (!user) {
    return null;
  }

  return (
    <div className="flex h-screen flex-col">
      <div className="border-b bg-card px-6 py-4">
        <h1 className="text-2xl font-semibold">Analytics</h1>
        <p className="text-sm text-muted-foreground">
          Track engagement metrics and performance
        </p>
      </div>
      <AnalyticsView />
    </div>
  );
}
