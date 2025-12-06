import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function createTestData() {
  try {
    console.log("Creating test data...\n");

    // Create test contacts
    const contacts = [
      { firstName: "Jane", lastName: "Smith", phoneNumber: "+15559876543", email: "jane.smith@example.com", company: "Tech Corp" },
      { firstName: "Alice", lastName: "Johnson", phoneNumber: "+15551112222", email: "alice@example.com", company: "Startup Inc" },
      { firstName: "Bob", phoneNumber: "+15553334444", email: "bob@example.com" },
      { firstName: "Charlie", lastName: "Brown", phoneNumber: "+15554445555", email: "charlie@example.com", company: "ACME Corp" },
    ];

    const createdContacts = [];
    for (const contactData of contacts) {
      try {
        const contact = await prisma.contact.create({
          data: contactData,
        });
        createdContacts.push(contact);
        console.log(`✅ Created contact: ${contact.firstName} ${contact.lastName || ""}`);
      } catch (error: any) {
        if (error.code === "P2002") {
          console.log(`⚠️  Contact ${contactData.phoneNumber} already exists`);
        }
      }
    }

    // Get or create a user for testing
    let user = await prisma.user.findFirst({
      where: { email: "newuser@example.com" },
    });

    if (!user) {
      console.log("\n❌ No user found. Please create a user first via signup.");
      return;
    }

    // Create test conversations and messages for some contacts
    for (let i = 0; i < Math.min(2, createdContacts.length); i++) {
      const contact = createdContacts[i];
      
      // Get or create conversation
      let conversation = await prisma.conversation.findFirst({
        where: { contactId: contact.id },
      });

      if (!conversation) {
        conversation = await prisma.conversation.create({
          data: {
            contactId: contact.id,
            status: "OPEN",
            unreadCount: i % 2, // Alternate unread count
          },
        });
      }

      // Create test messages
      const messages = [
        {
          body: `Hello ${contact.firstName}! This is a test SMS message.`,
          channel: "SMS" as const,
          direction: "OUTBOUND" as const,
          status: "DELIVERED" as const,
        },
        {
          body: `Hi there! This is a WhatsApp test message.`,
          channel: "WHATSAPP" as const,
          direction: "OUTBOUND" as const,
          status: "SENT" as const,
        },
        {
          body: `Thanks for your message!`,
          channel: "SMS" as const,
          direction: "INBOUND" as const,
          status: "DELIVERED" as const,
        },
      ];

      for (const msgData of messages) {
        await prisma.message.create({
          data: {
            conversationId: conversation.id,
            senderId: msgData.direction === "OUTBOUND" ? user.id : null,
            channel: msgData.channel,
            direction: msgData.direction,
            body: msgData.body,
            mediaUrls: [],
            status: msgData.status,
            sentAt: new Date(Date.now() - (messages.indexOf(msgData) * 3600000)), // Stagger times
            deliveredAt: msgData.status === "DELIVERED" ? new Date() : null,
          },
        });
      }

      // Update conversation last message time
      await prisma.conversation.update({
        where: { id: conversation.id },
        data: {
          lastMessageAt: new Date(),
        },
      });

      console.log(`✅ Created conversation with messages for ${contact.firstName}`);
    }

    // Create notes on contacts
    for (let i = 0; i < Math.min(2, createdContacts.length); i++) {
      const contact = createdContacts[i];
      await prisma.note.create({
        data: {
          contactId: contact.id,
          userId: user.id,
          content: `This is a test note about ${contact.firstName}. They are a potential lead.`,
          isPrivate: i === 0, // First note is private
        },
      });
      console.log(`✅ Created note for ${contact.firstName}`);
    }

    console.log("\n✅ Test data created successfully!");
    console.log(`   - ${createdContacts.length} contacts`);
    console.log(`   - ${createdContacts.length} conversations with messages`);
    console.log(`   - ${createdContacts.length} notes`);

    await prisma.$disconnect();
  } catch (error: any) {
    console.error("❌ Error:", error.message);
    await prisma.$disconnect();
    process.exit(1);
  }
}

createTestData();
