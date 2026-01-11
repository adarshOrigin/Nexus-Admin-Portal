
import type { NextAuthConfig } from "next-auth"
import { Role } from "@prisma/client"

export const authConfig = {
    pages: {
        signIn: '/auth/signin',
    },
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user
            const isOnDashboard = nextUrl.pathname.startsWith('/dashboard')
            const isOnAdmin = nextUrl.pathname.startsWith('/admin')

            if (isOnAdmin) {
                if (isLoggedIn) {
                    const role = (auth.user as any)?.role
                    const permissions = (auth.user as any)?.permissions || []

                    if (role === 'ADMIN' || permissions.includes('MANAGE_USERS')) return true
                    return Response.redirect(new URL('/dashboard?error=AccessDenied', nextUrl))
                }
                return false // Redirect to login
            }

            if (isOnDashboard) {
                if (isLoggedIn) return true
                return false // Redirect unauthenticated users to login
            }

            return true
        },
        async jwt({ token, user, trigger, session }) {
            // This callback is used by middleware to check properties
            if (user) {
                token.role = (user as any).role
                token.permissions = (user as any).permissions
            }
            if (trigger === "update" && session) {
                token.role = session.user.role
                token.permissions = session.user.permissions
            }
            return token
        },
        async session({ session, token }) {
            // This callback is used by middleware to check properties
            if (session.user) {
                (session.user as any).role = token.role as Role || 'VIEWER';
                (session.user as any).permissions = token.permissions || [];
            }
            return session
        }
    },
    providers: [], // Configured in auth.ts
} satisfies NextAuthConfig
