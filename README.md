# Nexus-Admin-Portal

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Production Environment Setup

To deploy this application to production (e.g., Vercel) with a **Supabase** database:

### 1. Database URL Configuration
Supabase provides two connection strings. You must set **BOTH** in your production environment variables:

*   **`DATABASE_URL`**: Use the **Transaction Pooler URL** (Port 6543).
    *   Format: `postgres://[user]:[password]@aws-0-region.pooler.supabase.com:6543/postgres?pgbouncer=true`
    *   *Note: Ensure `?pgbouncer=true` is appended.*
*   **`DIRECT_URL`**: Use the **Session Pooler / Direct URL** (Port 5432).
    *   Format: `postgres://[user]:[password]@aws-0-region.supabase.com:5432/postgres`

### 2. Environment Variables
Ensure the following are set in your deployment dashboard (e.g., Vercel Project Settings):

```bash
# Database
DATABASE_URL="..."
DIRECT_URL="..."

# Authentication
AUTH_SECRET="Generating a new secret with 'npx auth secret'"
NEXTAUTH_URL="https://your-domain.vercel.app" 

# OAuth (Google Cloud Console)
AUTH_GOOGLE_ID="..."
AUTH_GOOGLE_SECRET="..."
```

### 3. Deploy
1.  Push code to GitHub.
2.  Import project in Vercel.
3.  Add the environment variables above.
4.  Deploy!

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
