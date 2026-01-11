
import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import Credentials from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import { Role } from "@prisma/client"
import { z } from "zod"
import bcrypt from "bcryptjs"
import { authConfig } from "./auth.config"

const passwordSchema = z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Must contain at least one uppercase letter")
    .regex(/[0-9]/, "Must contain at least one number")
    .regex(/[^a-zA-Z0-9]/, "Must contain at least one special character")

export const { handlers, signIn, signOut, auth } = NextAuth({
    ...authConfig,
    callbacks: {
        ...authConfig.callbacks,
        async jwt({ token, user, trigger, session }) {
            if (user) {
                token.id = user.id
                token.role = (user as any).role
                token.permissions = (user as any).permissions
            }

            // On update, REFATCCH user data from DB to ensure security
            // On update, REFATCH user data from DB to ensure security
            // We do NOT rely on session object passed from client for ID
            if (trigger === "update") {
                // Ensure we use the ID from the token to avoid ID injection if possible, 
                // but token.sub is usually the ID.
                const userId = token.sub
                if (userId) {
                    const freshUser = await prisma.user.findUnique({
                        where: { id: userId }
                    })
                    if (freshUser) {
                        token.role = freshUser.role
                        token.permissions = freshUser.permissions
                    }
                }
            }
            return token
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.sub!
                    ; (session.user as any).role = token.role as Role || 'VIEWER'
                    ; (session.user as any).permissions = token.permissions || []
            }
            return session
        }
    },
    adapter: PrismaAdapter(prisma) as any,
    session: { strategy: "jwt" },
    providers: [
        Google({
            clientId: process.env.AUTH_GOOGLE_ID,
            clientSecret: process.env.AUTH_GOOGLE_SECRET,
            allowDangerousEmailAccountLinking: true,
            authorization: {
                params: {
                    prompt: "consent",
                    access_type: "offline",
                    response_type: "code"
                }
            }
        }),
        Credentials({
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            authorize: async (credentials) => {
                const parsedCredentials = z.object({
                    email: z.string().email(),
                    password: z.string() // Complex validation only needed for registration
                }).safeParse(credentials)

                if (parsedCredentials.success) {
                    const { email, password } = parsedCredentials.data
                    const user = await prisma.user.findUnique({ where: { email } })
                    if (!user || !user.password) return null
                    const passwordsMatch = await bcrypt.compare(password, user.password)
                    if (passwordsMatch) return user
                }
                return null
            }
        })
    ],
})
