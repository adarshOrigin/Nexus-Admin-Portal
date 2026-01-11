
import { Role } from "@prisma/client"
import NextAuth, { DefaultSession } from "next-auth"
import { AdapterUser } from "next-auth/adapters"

declare module "next-auth" {
    interface Session {
        user: {
            role: Role
        } & DefaultSession["user"]
    }

    interface User {
        role: Role
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        role: Role
    }
}

declare module "next-auth/adapters" {
    interface AdapterUser {
        role: Role
    }
}
