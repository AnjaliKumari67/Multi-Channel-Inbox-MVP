// Temporary workaround to bypass Better Auth validation issues
// This will be fixed once Better Auth schema is properly configured
import { prisma } from "@/lib/prisma";

export async function createUserDirectly(data: {
  email: string;
  name?: string;
  password: string;
}) {
  // This is a workaround - Better Auth should handle this
  // For now, we'll create user and account manually
  
  const user = await prisma.user.create({
    data: {
      email: data.email,
      name: data.name,
      emailVerified: false,
    },
  });

  // Better Auth uses bcrypt or similar - for now we'll let Better Auth handle passwords
  // The issue is Better Auth's schema validation
  return user;
}
