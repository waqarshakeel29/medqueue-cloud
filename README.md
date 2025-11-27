# MedQueue Cloud

A modern, production-ready SaaS clinic and hospital management system built with Next.js, TypeScript, and PostgreSQL.

## Features

- 📅 **Appointment Management** - Schedule and manage appointments with automatic token assignment
- 🎫 **Queue System** - Real-time queue management with token printing
- 👥 **Patient Management** - Comprehensive patient records and history
- 👨‍⚕️ **Multi-Doctor Support** - Manage multiple doctors with individual queues
- 💰 **Billing & Invoices** - Generate invoices and track payments
- 💳 **Stripe Integration** - Subscription-based SaaS billing with 14-day free trials
- 🔐 **Multi-Tenant Architecture** - Secure row-level multi-tenancy
- 📱 **Responsive Design** - Works on desktop, tablet, and mobile

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Database:** PostgreSQL with Prisma ORM
- **Auth:** NextAuth.js (Auth.js)
- **Styling:** Tailwind CSS
- **UI Components:** shadcn/ui
- **Animations:** Framer Motion
- **Payments:** Stripe

## Getting Started

### Prerequisites

- Node.js 20.19+ (or 22.12+, or 24.0+)
- PostgreSQL database
- Stripe account (for payments)

### Installation

1. Clone the repository:
```bash
cd ~/Developers/OwnProducts/medqueue-cloud
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` and fill in your values:
- `DATABASE_URL` - Your PostgreSQL connection string
- `NEXTAUTH_SECRET` - Generate with `openssl rand -base64 32`
- `NEXTAUTH_URL` - Your application URL (http://localhost:3000 for dev)
- Stripe keys from your Stripe dashboard

4. Set up the database:
```bash
npx prisma migrate dev
```

5. Generate Prisma Client:
```bash
npx prisma generate
```

6. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
medqueue-cloud/
├── app/
│   ├── (public)/          # Marketing pages
│   ├── (auth)/            # Authentication pages
│   ├── (app)/             # Authenticated app
│   │   └── app/
│   │       └── clinic/
│   │           └── [clinicId]/
│   │               ├── appointments/
│   │               ├── queue/
│   │               ├── patients/
│   │               ├── doctors/
│   │               ├── billing/
│   │               └── settings/
│   └── api/               # API routes
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   └── ...
├── lib/                  # Utility functions
├── prisma/               # Database schema and migrations
└── types/                # TypeScript type definitions
```

## Key Features Implementation

### Authentication

- Email/password authentication with NextAuth.js
- Session-based auth
- Role-based access control (ADMIN, DOCTOR, RECEPTION)

### Multi-Tenancy

- Row-level security using `clinicId` foreign keys
- Users can belong to multiple clinics
- Automatic access control in middleware and API routes

### Appointments

- Create appointments with automatic token number assignment
- Filter by date and doctor
- Update appointment status
- Print queue tokens

### Queue Management

- Real-time queue updates (polls every 5 seconds)
- Doctor-specific queues
- Status management (Scheduled → Checked In → In Consultation → Completed)

### Token Printing

- Optimized for 80mm thermal printers
- Print-friendly route at `/app/clinic/[clinicId]/token/[appointmentId]/print`

### Billing

- Create invoices linked to appointments
- Track payment status
- Invoice items with service details

### Stripe Integration

- 14-day free trial on clinic creation
- Subscription management
- Webhook handling for subscription events
- Trial expiry and paywall logic

## Database Schema

Key models:
- `User` - Application users
- `Clinic` - Clinics/workspaces
- `ClinicMembership` - User-clinic relationship with roles
- `Doctor` - Doctors in a clinic
- `Patient` - Patients
- `Appointment` - Appointments with tokens
- `Invoice` - Billing invoices
- `Subscription` - Stripe subscription data

See `prisma/schema.prisma` for the complete schema.

## Environment Variables

Required environment variables (see `.env.example`):

- `DATABASE_URL` - PostgreSQL connection string
- `NEXTAUTH_URL` - Application URL
- `NEXTAUTH_SECRET` - NextAuth secret key
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Stripe publishable key
- `STRIPE_SECRET_KEY` - Stripe secret key
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook secret
- `STRIPE_PRICE_ID_BASIC` - Stripe price ID for Basic plan
- `STRIPE_PRICE_ID_PRO` - Stripe price ID for Pro plan
- `CRON_SECRET` - Secret for protecting cron endpoints

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import the project in Vercel
3. Add environment variables in Vercel dashboard
4. Set up PostgreSQL database (Vercel Postgres or external)
5. Run migrations: `npx prisma migrate deploy`

### Docker

Coming soon - Docker configuration can be added for containerized deployment.

## Development

### Database Migrations

Create a new migration:
```bash
npx prisma migrate dev --name migration_name
```

Apply migrations in production:
```bash
npx prisma migrate deploy
```

### Prisma Studio

View and edit database data:
```bash
npx prisma studio
```

## License

This project is proprietary software.

## Support

For issues and questions, please contact support@medqueue.cloud
