
'use server'

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { Role, RequestStatus } from "@prisma/client"
import { revalidatePath } from "next/cache"

// formData ignored but required for form action type compatibility
export async function approveAccessRequest(requestId: string, formData?: FormData) {
    const session = await auth()

    if (!session?.user?.email) return { error: "Unauthorized" }

    const currentUser = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { role: true, permissions: true }
    })

    if (currentUser?.role !== Role.ADMIN && !currentUser?.permissions.includes('MANAGE_USERS')) {
        return { error: "Permission Denied" }
    }

    try {
        // Transaction to update both Request and User
        await prisma.$transaction(async (tx) => {
            const request = await tx.accessRequest.findUnique({ where: { id: requestId } })
            if (!request) throw new Error("Request not found")

            // Update Request
            await tx.accessRequest.update({
                where: { id: requestId },
                data: { status: RequestStatus.APPROVED }
            })

            const user = await tx.user.findUnique({ where: { id: request.userId } })
            if (!user) throw new Error("User not found")

            // Merge permissions ensuring uniqueness
            const newPermissions = Array.from(new Set([...user.permissions, ...request.requestedPermissions]))

            // Update User Role
            await tx.user.update({
                where: { id: request.userId },
                data: {
                    role: request.requestedRole,
                    permissions: newPermissions
                }
            })
        })

        revalidatePath('/admin/requests')
        return { success: true }
    } catch (error) {
        console.error(error)
        return { error: "Failed to process request" }
    }
}

export async function rejectAccessRequest(requestId: string, formData?: FormData) {
    const session = await auth()
    if (!session?.user?.email) return { error: "Unauthorized" }

    const currentUser = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { role: true, permissions: true }
    })

    if (currentUser?.role !== Role.ADMIN && !currentUser?.permissions.includes('MANAGE_USERS')) {
        return { error: "Permission Denied" }
    }

    try {
        await prisma.accessRequest.update({
            where: { id: requestId },
            data: { status: RequestStatus.REJECTED }
        })
        revalidatePath('/admin/requests')
        return { success: true }
    } catch (error) {
        return { error: "Failed to process request" }
    }
}
