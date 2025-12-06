import { getCurrentUser } from "@/lib/auth-helpers";
import { ContactsView } from "@/components/contacts/contacts-view";

export default async function ContactsPage() {
  const user = await getCurrentUser();

  if (!user) {
    return null;
  }

  return (
    <div className="flex h-screen flex-col">
      <div className="border-b bg-card px-6 py-4">
        <h1 className="text-2xl font-semibold">Contacts</h1>
        <p className="text-sm text-muted-foreground">
          Manage your customer contacts
        </p>
      </div>
      <ContactsView />
    </div>
  );
}
