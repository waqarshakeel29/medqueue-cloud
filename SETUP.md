# Setup Guide

This guide will help you get MedQueue Cloud up and running.

## Prerequisites

1. **Node.js**: Version 20.19+, 22.12+, or 24.0+
2. **PostgreSQL**: Running PostgreSQL database (local or hosted)
3. **Stripe Account**: For payment processing (optional for development)

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

**Required Variables:**

- `DATABASE_URL`: Your PostgreSQL connection string
  - Example: `postgresql://user:password@localhost:5432/medqueue?schema=public`
  
- `NEXTAUTH_SECRET`: Generate with:
  ```bash
  openssl rand -base64 32
  ```

- `NEXTAUTH_URL`: Your app URL
  - Development: `http://localhost:3000`
  - Production: Your production URL

**Stripe Variables (Optional for Development):**

1. Create a Stripe account at https://stripe.com
2. Get your API keys from the Stripe dashboard
3. Create products and prices in Stripe:
   - Basic plan: $29/month
   - Pro plan: $79/month
4. Copy the Price IDs from Stripe and add to `.env`:
   - `STRIPE_PRICE_ID_BASIC`
   - `STRIPE_PRICE_ID_PRO`

### 3. Set Up Database

```bash
# Create database migrations
npx prisma migrate dev --name init

# Generate Prisma Client
npx prisma generate
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## First Steps After Setup

1. **Register**: Create your account at `/auth/register`
   - This will create your clinic and start a 14-day free trial

2. **Onboarding**: Complete the onboarding flow
   - Add at least one doctor
   - Set up working hours (optional)

3. **Start Using**: 
   - Add patients
   - Create appointments
   - Manage your queue

## Stripe Setup (For Production)

### Create Products in Stripe

1. Go to Stripe Dashboard → Products
2. Create two products:
   - **Basic Plan**: $29/month
   - **Pro Plan**: $79/month
3. Copy the Price IDs (starts with `price_...`)
4. Add them to your `.env` file

### Set Up Webhooks

1. Go to Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://yourdomain.com/api/stripe/webhook`
3. Select events:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
4. Copy the webhook signing secret to `.env` as `STRIPE_WEBHOOK_SECRET`

## Cron Jobs Setup

Set up cron jobs to call these endpoints daily:

- **Daily Summary**: `GET /api/cron/daily-summary`
  - Header: `x-cron-secret: YOUR_CRON_SECRET`
  - Schedule: Daily at midnight

- **Appointment Reminders**: `GET /api/cron/reminders`
  - Header: `x-cron-secret: YOUR_CRON_SECRET`
  - Schedule: Daily at 9 AM

Example with cron:
```bash
0 0 * * * curl -H "x-cron-secret: YOUR_SECRET" https://yourdomain.com/api/cron/daily-summary
0 9 * * * curl -H "x-cron-secret: YOUR_SECRET" https://yourdomain.com/api/cron/reminders
```

Or use a service like Vercel Cron Jobs or EasyCron.

## Troubleshooting

### Database Connection Issues

- Verify your `DATABASE_URL` is correct
- Ensure PostgreSQL is running
- Check database exists

### Prisma Issues

- Run `npx prisma generate` after schema changes
- Run `npx prisma migrate dev` to apply migrations
- Use `npx prisma studio` to view data

### Authentication Issues

- Verify `NEXTAUTH_SECRET` is set
- Check `NEXTAUTH_URL` matches your actual URL
- Clear browser cookies and try again

### Stripe Issues

- Verify all Stripe environment variables are set
- Check Stripe webhook URL is accessible
- Verify webhook secret matches Stripe dashboard

## Next Steps

- Customize your clinic settings
- Add more doctors and services
- Configure working hours
- Set up email/SMS notifications (extend cron endpoints)

## Support

For issues, check the main README.md or contact support.

