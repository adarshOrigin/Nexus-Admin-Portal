'use server'

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { Role } from "@prisma/client"
import { revalidatePath } from "next/cache"

export async function updateUser(userId: string, data: { role: Role, permissions: string[] }) {
    const session = await auth()

    // Check Admin
    if (!session?.user?.email) return { error: "Unauthorized" }

    // We need to fetch the current user's role from DB to be checking permissions accurately
    // trusting session claims only if we assume they are fresh (which they might not be)
    // better to fetch `currentUser` from DB.
    const currentUser = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { role: true, permissions: true }
    })

    if (currentUser?.role !== Role.ADMIN && !currentUser?.permissions.includes('MANAGE_USERS')) {
        return { error: "Permission Denied" }
    }

    try {
        await prisma.user.update({
            where: { id: userId },
            data: {
                role: data.role,
                permissions: data.permissions
            } as any // Cast for TS error
        })

        revalidatePath('/admin/users')
        return { success: true }
    } catch (error) {
        console.error(error)
        return { error: "Failed to update user" }
    }
}
