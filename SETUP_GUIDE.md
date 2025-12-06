# 🚀 Complete Setup Guide - Unified Multi-Channel Inbox

Welcome! This guide will walk you through setting up and running the Unified Multi-Channel Inbox platform step by step. Don't worry - we'll make it easy!

## 📋 What You'll Need

Before we start, make sure you have:
- **Node.js 18+** installed ([Download here](https://nodejs.org/))
- A **Twilio account** (we'll use the free trial to get started)
- A **Neon PostgreSQL database** (free tier available)
- A text editor (VS Code recommended)

That's it! Let's get started.

---

## Step 1: Get the Code Ready 📥

First, let's make sure all the code files are in place:

```bash
# If you haven't already, navigate to your project folder
cd "/Users/manishsoni/Attack Capital Assignment"

# Install all the required packages
npm install
```

This might take a minute or two - grab a coffee ☕ while it installs!

---

## Step 2: Set Up Your Database 🗄️

You'll need a PostgreSQL database. We recommend **Neon** (it's free and easy!):

1. **Create a Neon account**: Go to [neon.tech](https://neon.tech) and sign up (it's free!)
2. **Create a new project**: Click "Create Project" and give it a name
3. **Copy your connection string**: You'll see something like:
   ```
   postgresql://username:password@host/database?sslmode=require
   ```
   Copy this - we'll use it in the next step!

---

## Step 3: Configure Environment Variables 🔐

Create a file called `.env.local` in your project root (same folder as `package.json`):

```bash
# Create the file (Mac/Linux)
touch .env.local

# Or just open your editor and create it manually
```

Now, add these environment variables to `.env.local`:

```env
# ========================================
# DATABASE CONNECTION
# ========================================
# Paste your Neon connection string here
DATABASE_URL=postgresql://your-username:your-password@host/database?sslmode=require

# ========================================
# AUTHENTICATION (Better Auth)
# ========================================
# Generate a random secret (at least 32 characters)
# You can use: openssl rand -base64 32
BETTER_AUTH_SECRET=your-super-secret-key-at-least-32-characters-long-change-this-in-production
BETTER_AUTH_URL=http://localhost:3000

# Google OAuth (Optional - leave empty for now)
BETTER_AUTH_GOOGLE_CLIENT_ID=
BETTER_AUTH_GOOGLE_CLIENT_SECRET=

# ========================================
# TWILIO CONFIGURATION
# ========================================
# Get these from your Twilio Console (console.twilio.com)
TWILIO_ACCOUNT_SID=your-account-sid-here
TWILIO_AUTH_TOKEN=your-auth-token-here
TWILIO_PHONE_NUMBER=+1234567890
TWILIO_WHATSAPP_SANDBOX_NUMBER=whatsapp:+1234567890

# ========================================
# APPLICATION SETTINGS
# ========================================
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000

# For scheduled messages (generate a random secret)
CRON_SECRET=another-random-secret-for-cron-jobs
```

### Getting Your Twilio Credentials

1. **Sign up for Twilio**: Go to [twilio.com/try-twilio](https://www.twilio.com/try-twilio)
2. **Get your credentials**:
   - Go to Twilio Console → Dashboard
   - Find your **Account SID** and **Auth Token**
   - Copy them into your `.env.local` file
3. **Get a phone number**:
   - Go to Phone Numbers → Manage → Buy a number
   - Choose a number with SMS capability
   - Copy the number (e.g., `+1234567890`) into `TWILIO_PHONE_NUMBER`

### WhatsApp Sandbox Setup (Optional)

1. Go to Twilio Console → Messaging → Try it out → Send a WhatsApp message
2. You'll see instructions to join the sandbox
3. Send the join code to the WhatsApp sandbox number provided in your Twilio console
4. Once joined, you can use WhatsApp!

---

## Step 4: Set Up the Database Schema 🏗️

Now let's create all the database tables:

```bash
# Generate the Prisma Client (this creates the database connection code)
npm run db:generate

# Push the schema to your database (creates all tables)
npm run db:push
```

You should see something like:
```
✔ Generated Prisma Client
✔ Database schema pushed successfully
```

Great! Your database is ready! 🎉

---

## Step 5: Start the Development Server 🖥️

Time to see it in action:

```bash
# If you encounter build errors, clear the cache first:
rm -rf .next

# Then start the dev server:
npm run dev
```

You should see:
```
✓ Ready in 2.3s
○ Compiling /login ...
✓ Compiled successfully
```

**If you see any errors about missing modules**, just clear the `.next` folder and restart:
```bash
rm -rf .next && npm run dev
```

Open your browser and go to:
```
http://localhost:3000
```

You should see the login page! 🎊

---

## Step 6: Create Your First Account 👤

1. **Click "Sign up"** on the login page
2. **Fill in the form**:
   - Email: Your email address
   - Password: Choose a secure password
   - Name: Your display name
3. **Click "Sign Up"**

You'll be automatically logged in and redirected to the inbox!

---

## Step 7: Test the Features 🧪

Now let's make sure everything works:

### Test 1: Add a Contact 📇
1. Click "Contacts" in the sidebar
2. Click "Add Contact"
3. Fill in:
   - First Name: Test
   - Last Name: Contact
   - Phone Number: +1234567890 (your phone number)
4. Click "Create Contact"

### Test 2: Send a Message 💬
1. Go to "Inbox"
2. If you see your test contact, click on it
3. If not, go back to Contacts and click on your contact
4. Type a message in the composer
5. Select "SMS" or "WhatsApp"
6. Click the send button (✈️)

**Note**: For SMS/WhatsApp to work, you need to configure Twilio webhooks (see below).

### Test 3: Schedule a Message 📅
1. In a conversation, type a message
2. Click the **calendar icon** (📅) next to the send button
3. Pick a date and time in the future
4. Click "Schedule"

The message will appear in the "Scheduled" tab!

### Test 4: View Analytics 📊
1. Click "Analytics" in the sidebar
2. You should see charts showing message statistics

---

## Step 8: Configure Twilio Webhooks (For Real Messages) 📡

To receive real SMS/WhatsApp messages, you need to configure webhooks:

### For Local Development (using ngrok)

1. **Install ngrok**: [Download ngrok](https://ngrok.com/download)
2. **Start your dev server**: `npm run dev`
3. **In another terminal, run ngrok**:
   ```bash
   ngrok http 3000
   ```
4. **Copy the HTTPS URL** (e.g., `https://abc123.ngrok.io`)

### Configure in Twilio Console:

1. Go to **Phone Numbers** → **Manage** → **Active numbers**
2. Click on your phone number
3. Scroll to **Messaging Configuration**
4. Under **Webhook**, set:
   - **A MESSAGE COMES IN**: `https://your-ngrok-url.ngrok.io/api/webhooks/twilio`
   - **STATUS CALLBACK URL**: `https://your-ngrok-url.ngrok.io/api/webhooks/twilio`
5. Click **Save**

Now send a text to your Twilio number - it should appear in your inbox! 📱

---

## Step 9: Set Up Scheduled Messages (Optional) ⏰

If you want scheduled messages to automatically send, set up a cron job:

### Option A: Using Vercel Cron (Recommended for Production)

Create a `vercel.json` file in your project root:

```json
{
  "crons": [
    {
      "path": "/api/cron/process-scheduled",
      "schedule": "*/5 * * * *"
    }
  ]
}
```

This runs every 5 minutes.

### Option B: Local Testing

You can manually trigger it:
```bash
curl -X GET "http://localhost:3000/api/cron/process-scheduled" \
  -H "Authorization: Bearer your-cron-secret"
```

Or use a tool like `cron` or `node-cron` to schedule it locally.

---

## 🎯 Quick Reference

### Common Commands

```bash
# Start development server
npm run dev

# Generate Prisma Client (after schema changes)
npm run db:generate

# Push database schema changes
npm run db:push

# Open Prisma Studio (database GUI)
npm run db:studio

# Run linting
npm run lint

# Format code
npm run format
```

### Important URLs

- **Application**: http://localhost:3000
- **Login**: http://localhost:3000/login
- **Signup**: http://localhost:3000/signup
- **Inbox**: http://localhost:3000/inbox
- **Contacts**: http://localhost:3000/contacts
- **Analytics**: http://localhost:3000/analytics
- **Settings**: http://localhost:3000/settings

---

## 🐛 Troubleshooting

### "Cannot connect to database"
- ✅ Check your `DATABASE_URL` in `.env.local`
- ✅ Make sure your Neon database is running
- ✅ Verify the connection string format

### "Prisma Client not generated"
- ✅ Run `npm run db:generate`
- ✅ Check that `DATABASE_URL` is set correctly

### "Authentication not working"
- ✅ Make sure `BETTER_AUTH_SECRET` is at least 32 characters
- ✅ Verify `BETTER_AUTH_URL` matches your app URL
- ✅ Check that database tables were created (`npm run db:push`)

### "Twilio messages not sending"
- ✅ Verify Twilio credentials are correct
- ✅ Check you have credits in your Twilio account (trial account has $15.50)
- ✅ Make sure your phone number is verified (for testing)

### "Scheduled messages not showing"
- ✅ Check that you selected a future date/time
- ✅ Look in the "Scheduled" tab in the inbox
- ✅ Verify the message was created in the database

### "Port 3000 already in use"
- ✅ Stop other Node.js processes: `lsof -ti:3000 | xargs kill`
- ✅ Or use a different port: `npm run dev -- -p 3001`

---

## 📚 Next Steps

Once everything is working:

1. **Customize your setup**: Update branding, colors, etc.
2. **Add more contacts**: Import or manually add contacts
3. **Send test messages**: Try SMS and WhatsApp
4. **Schedule messages**: Test the scheduling feature
5. **Set up production**: Deploy to Vercel or your preferred platform

---

## 🆘 Need Help?

If you run into issues:

1. **Check the logs**: Look at your terminal for error messages
2. **Verify environment variables**: Make sure `.env.local` is complete
3. **Check database**: Use `npm run db:studio` to see your data
4. **Test API endpoints**: Try accessing `/api/messages` directly

---

## ✨ You're All Set!

Congratulations! You've successfully set up the Unified Multi-Channel Inbox platform. 

**Happy messaging!** 💬✨

---

*Last updated: 2024*
