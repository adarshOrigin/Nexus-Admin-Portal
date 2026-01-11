
'use server'

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { Role } from "@prisma/client"
import { revalidatePath } from "next/cache"

export async function approveLoan(loanId: string) {
    const session = await auth()

    if (!session?.user?.email) {
        throw new Error("Unauthorized")
    }

    // Double check RBAC on server side
    // Ideally this check mirrors the middleware/policy, but here we can be granular.
    // Requirement: VIEWER cannot approve.
    // So ADMIN or MANAGER can.

    // Note: session.user.role is typed as Role but we should cast or trust auth.ts
    const role = (session.user as any).role as Role

    if (role === Role.VIEWER) {
        throw new Error("Permission Denied: You must be a MANAGER or ADMIN to perform this action.")
    }

    try {
        await prisma.loanApplication.update({
            where: { id: loanId },
            data: { status: 'APPROVED' }
        })
        revalidatePath('/dashboard')
        return { success: true }
    } catch (error) {
        console.error("Failed to approve loan", error)
        return { success: false, message: "Failed to update loan" }
    }
}

export async function rejectLoan(loanId: string) {
    // Similar logic, implementing for completeness
    const session = await auth()
    if (!session?.user?.email) throw new Error("Unauthorized")

    const role = (session.user as any).role as Role
    if (role === Role.VIEWER) {
        throw new Error("Permission Denied")
    }

    try {
        await prisma.loanApplication.update({
            where: { id: loanId },
            data: { status: 'REJECTED' }
        })
        revalidatePath('/dashboard')
        return { success: true }
    } catch (error) {
        return { success: false }
    }
}
