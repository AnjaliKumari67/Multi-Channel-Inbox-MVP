# Unified Inbox Platform - User Guide

## Getting Started

### 1. Access the Platform

Open your browser and navigate to:
```
http://localhost:3000
```

### 2. Sign Up / Login

**First Time Users:**
1. Go to `http://localhost:3000/signup`
2. Fill in the form:
   - Email: Your email address
   - Password: Choose a secure password
   - Name: Your full name
3. Click "Sign Up"
4. You'll be automatically logged in and redirected to the inbox

**Returning Users:**
1. Go to `http://localhost:3000/login`
2. Enter your email and password
3. Click "Sign In"

**Note:** For testing, you can use:
- Email: `test@example.com`
- Password: `testpassword123`

---

## Using the Inbox

### Viewing Conversations

1. Click **"Inbox"** in the left sidebar
2. You'll see a list of all conversations on the left
3. Click any conversation to view messages

### Understanding the Layout

The inbox has **three main sections**:

```
┌─────────────────┬──────────────────┬─────────────────┐
│  Conversations  │   Messages       │  Contact Info   │
│  (Left Panel)   │   (Center)       │  (Right Panel)  │
└─────────────────┴──────────────────┴─────────────────┘
```

### Sending Messages

1. Select a conversation from the left panel
2. In the center panel, you'll see:
   - Message history at the top
   - Input box at the bottom
3. **Select Channel** (SMS or WhatsApp):
   - Click the channel dropdown next to the input
   - Choose SMS or WhatsApp
4. **Type your message** in the input box
5. **Send** by:
   - Pressing `Enter` (single line)
   - Pressing `Shift + Enter` (new line, then Enter to send)

### Searching Conversations

1. In the inbox, use the **"Search conversations..."** box at the top
2. Type a contact name or message content
3. Conversations will filter in real-time

---

## Managing Contacts

### Viewing Contacts

1. Click **"Contacts"** in the left sidebar
2. See all your contacts in a grid view

### Adding a New Contact

1. Click **"Add Contact"** button (top right)
2. Fill in the form:
   - **First Name** (required)
   - **Last Name** (optional)
   - **Phone Number** (required, format: +1234567890)
   - **Email** (optional)
   - **Company** (optional)
3. Click **"Create Contact"**

### Searching Contacts

1. Use the **"Search contacts..."** box at the top
2. Search by name, company, phone, or email
3. Results filter in real-time

### Contact Information

Each contact card shows:
- **Avatar**: Initials (e.g., "JD" for John Doe)
- **Name**: Full name
- **Company**: Company name (if available)
- **Phone**: Phone number with icon
- **Email**: Email address with icon

---

## Conversation Features

### Viewing Contact Details

When viewing a conversation:
- **Right sidebar** shows contact information
- **Contact Name & Company** at the top
- **Quick Actions**: Call and Email buttons
- **Contact Information**: Phone, email, creation date

### Adding Notes to Contacts

1. In the conversation view, scroll to the **Notes** section in the right sidebar
2. Type your note in the text box
3. (Optional) Check **"Private (only visible to me)"** to make it private
4. Click **"Add Note"**

**Use Notes For:**
- Meeting notes
- Important reminders
- Customer preferences
- Follow-up tasks

### Message Status Indicators

Messages show delivery status:
- **✓✓** = Delivered and read
- **✓** = Sent
- **Clock icon** = Pending
- **❌** = Failed

### Message Channels

Each message shows its channel:
- **SMS** badge for text messages
- **WHATSAPP** badge for WhatsApp messages
- **EMAIL** badge for emails (when implemented)

---

## Analytics Dashboard

### Viewing Analytics

1. Click **"Analytics"** in the left sidebar
2. View metrics including:
   - Total messages sent/received
   - Channel breakdown (SMS, WhatsApp, etc.)
   - Response rates
   - Engagement metrics

**Note:** Analytics populate as you use the platform more.

---

## Settings & Configuration

### Accessing Settings

1. Click **"Settings"** in the left sidebar
2. View your account and integration settings

### Twilio Integration

The Settings page shows:
- **Connection Status**: Whether Twilio is connected
- **Phone Number**: Your Twilio phone number
- **Account SID**: Your Twilio account identifier
- **WhatsApp Sandbox**: Instructions for testing WhatsApp

### Setting Up WhatsApp Testing

1. In Settings, find the **WhatsApp Sandbox** section
2. You'll see a code like `join [your-sandbox-code]`
3. Send this exact message from your WhatsApp to: **+1 415 523 8886**
4. You'll receive a confirmation
5. Now you can send/receive WhatsApp messages in the platform

### Webhook Configuration

For production use:
1. Copy the **Webhook URL** from Settings
2. Go to your Twilio Console
3. Navigate to Phone Numbers → Manage → Active Numbers
4. Click your phone number
5. Scroll to "Messaging Configuration"
6. Paste the webhook URL in the "A MESSAGE COMES IN" field
7. Save

---

## Best Practices

### Organizing Contacts

- **Add contacts immediately** when you start a conversation
- **Use company field** to group contacts
- **Add notes** for context and reminders

### Message Management

- **Check unread badges** regularly (red indicator on conversations)
- **Use search** to quickly find specific conversations
- **Channel selection matters**: Choose SMS for quick replies, WhatsApp for richer messages

### Communication Tips

- **Start conversations** by selecting a contact and sending your first message
- **Reply in context**: The platform groups messages by contact automatically
- **Use notes** to keep track of important details without cluttering the message thread

---

## Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| Send message | `Enter` |
| New line in message | `Shift + Enter` |
| Search conversations | Focus search box (Ctrl/Cmd + K) |

---

## Troubleshooting

### Can't Send Messages?

1. **Check Settings**: Ensure Twilio is connected
2. **Verify Phone Number**: Contact must have a valid phone number
3. **Check Channel**: Some contacts may only have SMS, not WhatsApp

### Messages Not Appearing?

1. **Refresh the page**
2. **Check the conversation list** - new messages create new conversations
3. **Verify webhook** is configured correctly in Twilio

### Contact Not Found?

1. **Use search** to find existing contacts
2. **Add new contact** if they don't exist
3. **Check spelling** in search query

### WhatsApp Not Working?

1. **Join the sandbox** first (see Settings instructions)
2. **Verify phone number** format is correct (+country code)
3. **Check Twilio console** for sandbox status

---

## Quick Start Checklist

- [ ] Sign up or log in
- [ ] Add at least one contact
- [ ] Send a test message
- [ ] View a conversation
- [ ] Add a note to a contact
- [ ] Check Settings for Twilio status
- [ ] (Optional) Set up WhatsApp sandbox

---

## Support

For issues or questions:
1. Check this user guide
2. Review the Settings page for integration status
3. Check Twilio Console for API issues
4. Review the TEST_REPORT.md for feature status

---

## Next Steps

1. **Import Contacts**: Add all your customer contacts
2. **Set Up Twilio**: Configure webhooks for production
3. **Test WhatsApp**: Join the sandbox and test WhatsApp messaging
4. **Start Conversations**: Begin reaching out to contacts
5. **Track Performance**: Monitor analytics as you use the platform

Enjoy using the Unified Inbox Platform! 🚀
