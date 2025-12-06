import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function createTestUser() {
  try {
    // Delete existing test user if exists
    await prisma.account.deleteMany({ where: { userId: { in: (await prisma.user.findMany({ where: { email: "test@example.com" } })).map(u => u.id) } } });
    await prisma.user.deleteMany({ where: { email: "test@example.com" } });

    // Create user
    const user = await prisma.user.create({
      data: {
        email: "test@example.com",
        name: "Test User",
        emailVerified: false,
        role: "ADMIN",
      },
    });

    console.log("✅ User created:", user);

    // Create account for email/password with bcrypt hash
    // Better Auth uses bcrypt for password hashing
    const hashedPassword = await bcrypt.hash("testpassword123", 10);

    // Better Auth uses "credential" as providerId for email/password auth
    const account = await prisma.account.create({
      data: {
        userId: user.id,
        accountId: user.email, // accountId is the email for credential provider
        providerId: "credential", // Better Auth uses "credential" for email/password
        password: hashedPassword,
      },
    });

    console.log("✅ Account created:", account);
    console.log("\n✅ Test user created successfully!");
    console.log("Email: test@example.com");
    console.log("Password: testpassword123");

    await prisma.$disconnect();
  } catch (error: any) {
    console.error("❌ Error:", error.message);
    if (error.code === "P2002") {
      console.log("User already exists.");
    }
    await prisma.$disconnect();
    process.exit(1);
  }
}

createTestUser();
