'use server'

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { RequestStatus } from "@prisma/client"

export async function checkUnreadApprovals() {
    const session = await auth()
    if (!session?.user?.id) return []

    try {
        const approvals = await prisma.accessRequest.findMany({
            where: {
                userId: session.user.id,
                status: RequestStatus.APPROVED,
                viewed: false
            },
            select: {
                id: true,
                requestedRole: true,
                requestedPermissions: true
            }
        })
        return approvals
    } catch (error) {
        console.error("Failed to check notifications:", error)
        return []
    }
}

export async function markNotificationAsRead(requestIds: string[]) {
    const session = await auth()
    if (!session?.user?.id) return false

    try {
        await prisma.accessRequest.updateMany({
            where: {
                id: { in: requestIds },
                userId: session.user.id
            },
            data: { viewed: true }
        })
        return true
    } catch (error) {
        console.error("Failed to mark notifications as read:", error)
        return false
    }
}
