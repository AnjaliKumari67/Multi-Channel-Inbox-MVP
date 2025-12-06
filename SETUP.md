# Quick Setup Guide

## Steps to Run the Application

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables

Create a `.env.local` file with the following variables:

```env
# Database (from your Neon connection string)
DATABASE_URL=postgresql://username:password@host/database?sslmode=require

# Better Auth
BETTER_AUTH_SECRET=your-super-secret-key-min-32-chars-for-production-change-this
BETTER_AUTH_URL=http://localhost:3000
BETTER_AUTH_GOOGLE_CLIENT_ID=
BETTER_AUTH_GOOGLE_CLIENT_SECRET=

# Twilio (get these from your Twilio Console)
TWILIO_ACCOUNT_SID=your-account-sid-here
TWILIO_AUTH_TOKEN=your-auth-token-here
TWILIO_PHONE_NUMBER=+1234567890
TWILIO_WHATSAPP_SANDBOX_NUMBER=

# App
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
CRON_SECRET=your-cron-secret
```

### 3. Set Up Database

```bash
# Generate Prisma Client
npm run db:generate

# Push schema to database (or run migrations)
npm run db:push
```

### 4. Configure Twilio Webhook

1. Go to Twilio Console → Phone Numbers → Manage → Active numbers
2. Click on your phone number
3. Under "Messaging", set webhook URL:
   - For SMS: `https://your-domain.com/api/webhooks/twilio`
   - For WhatsApp: `https://your-domain.com/api/webhooks/twilio`
4. For WhatsApp Sandbox, join by sending "join [your-sandbox-code]" to +1 415 523 8886

### 5. Run Development Server

```bash
npm run dev
```

Visit http://localhost:3000

### 6. Sign Up and Test

1. Create an account at `/signup`
2. Log in at `/login`
3. Navigate to `/inbox`
4. Test sending a message via SMS or WhatsApp

## Troubleshooting

### Lint Errors

If you see lint errors about missing dependencies, run:

```bash
npm install
```

### Better Auth Issues

Better Auth uses a catch-all route at `/api/auth/[...all]` which handles:
- `/api/auth/sign-in/email`
- `/api/auth/sign-up/email`
- `/api/auth/sign-in/social`
- `/api/auth/sign-out`

If authentication doesn't work, check:
1. `BETTER_AUTH_SECRET` is set (min 32 chars)
2. Database is accessible
3. Prisma Client is generated (`npm run db:generate`)

### Twilio Issues

1. Verify credentials are correct
2. Check webhook URL is configured
3. For WhatsApp, ensure sandbox is joined

### Database Connection

If database connection fails:
1. Check `DATABASE_URL` is correct
2. Verify Neon database is accessible
3. Run `npm run db:push` to create tables

## Next Steps

1. Set up Vercel Cron for scheduled messages (optional)
2. Configure Google OAuth (optional)
3. Deploy to Vercel or your preferred platform

## Important Notes

- The application uses polling (5-10s intervals) for real-time updates
- Scheduled messages require a cron job (see README.md)
- WhatsApp is in sandbox mode (trial account)
- SMS/WhatsApp are limited by Twilio trial account limits
