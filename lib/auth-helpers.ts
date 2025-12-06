import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

/**
 * Get the current session server-side
 */
export async function getSession() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  return session;
}

/**
 * Require authentication, redirect to login if not authenticated
 */
export async function requireAuth() {
  const session = await getSession();
  if (!session?.user) {
    redirect("/login");
  }
  return session;
}

/**
 * Get the current user
 */
export async function getCurrentUser() {
  const session = await getSession();
  return session?.user ?? null;
}
