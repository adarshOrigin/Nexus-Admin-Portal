# Nexus Admin Portal

A comprehensive Role-Based Access Control (RBAC) administration portal built with Next.js, Prisma, and NextAuth.js (Auth.js). This application manages users, permissions, and loan applications with a secure approval workflow.

## 🌟 Features

*   **Role-Based Access Control (RBAC):** Distinct roles for **Admin**, **Manager**, and **Viewer**.
*   **Authentication:** Secure login via Google OAuth and Credentials (Email/Password).
*   **User Management:** Admins can view, edit, and manage user roles and specific permissions.
*   **Access Request System:** Users can request role upgrades (e.g., Viewer -> Manager), which Admins must review and approve.
*   **Loan Management:** Managers and Admins can view, approve, or reject loan applications.
*   **Responsive Dashboard:** A modern, mobile-responsive UI built with Tailwind CSS and Shadcn UI.

## 🚀 Getting Started

### Prerequisites

*   Node.js 18+
*   PostgreSQL (Local or Supabase)

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/adarshOrigin/Nexus-Admin-Portal.git
    cd Nexus-Admin-Portal
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Environment Setup:**
    Create a `.env` file in the root directory:
    ```env
    # Database Connection
    DATABASE_URL="postgresql://user:password@localhost:5432/nexus_db"
    
    # NextAuth / Auth.js
    AUTH_SECRET="your-super-secret-key-generated-by-npx-auth-secret"
    NEXTAUTH_URL="http://localhost:3000"
    
    # Google OAuth (Optional for local dev if using credentials)
    AUTH_GOOGLE_ID="your-google-client-id"
    AUTH_GOOGLE_SECRET="your-google-client-secret"
    ```

4.  **Database Setup:**
    ```bash
    # Generate Prisma Client
    npx prisma generate
    
    # Push schema to database
    npx prisma db push
    
    # Seed the database with initial users and data
    npx prisma db seed
    ```

5.  **Run Development Server:**
    ```bash
    npm run dev
    ```

    Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📖 User Guide

### 1. Logging In
*   **Admin Access:**
    *   **Email:** `admin@nexus.com`
    *   **Password:** `password123`
    *   *Note: Has full access to all settings, user management, and requests.*
*   **Manager Access:**
    *   **Email:** `manager@nexus.com`
    *   **Password:** `password123`
    *   *Note: Can manage loans and view analytics.*
*   **Viewer Access:**
    *   **Email:** `viewer@nexus.com`
    *   **Password:** `password123`
    *   *Note: Read-only access initially.*
*   **New Users:** Sign in with Google. You will be assigned the **VIEWER** role by default.

### 2. Requesting Role Upgrades
If you are a **Viewer** and need more permissions:
1.  Go to your **Profile** (Click avatar in top right -> Profile & Permissions).
2.  Select the desired role (**Manager** or **Admin**).
3.  Fill out the reason for the request.
4.  Submit.
5.  An Admin will review your request in the "Access Requests" tab.

### 3. Managing Access (Admins Only)
*   Navigate to **Admin > Access Requests**.
*   Review pending requests.
*   **Approve:** The user's role is automatically updated.
*   **Reject:** The user stays in their current role.
*   Navigate to **Admin > Users** to manually edit specific permissions for any user.

### 4. Loan Management
*   **Managers** and **Admins** can see the Loan List on the Dashboard.
*   Click **Approve** or **Reject** on pending loans.
*   **Viewers** cannot perform these actions (buttons will show a "Request Access" modal).

## 📦 Deployment

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

## 🔄 Scheduled Database Maintenance

This project includes a Cron Job configuration (`vercel.json`) to reset the database weekly (Every Sunday at 00:00 UTC). This is useful for demo environments to keep data fresh.

### Setup on Vercel:

1.  Go to your Vercel Project Settings > **Cron Jobs**.
2.  You will see the job for `/api/cron/seed`.
3.  Go to **Environment Variables**.
4.  Add a new variable:
    *   **Key:** `CRON_SECRET`
    *   **Value:** *<A strong random string>*
5.  **Crucial Step:** You must also use this same secret when manually testing or if you want Vercel to secure it. Vercel automatically secures cron routes if you use their Cron dashboard, but setting this variable ensures your API endpoint is protected from public access.

*Note: If you do NOT want this behavior, simply remove the `vercel.json` file.*