'use server'

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { RequestStatus } from "@prisma/client"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const featureSchema = z.object({
    permissions: z.array(z.string()).min(1, "Select at least one feature"),
    reason: z.string().min(10, "Reason is required"),
})

export async function requestFeatureAccess(prevState: any, formData: FormData) {
    const session = await auth()
    if (!session?.user?.email) return { message: "Not authenticated" }

    const reason = formData.get("reason") as string
    const permissions = formData.getAll("permissions") as string[]

    const validated = featureSchema.safeParse({ permissions, reason })

    if (!validated.success) {
        return { message: "Invalid input", errors: validated.error.flatten().fieldErrors }
    }

    try {
        const user = await prisma.user.findUnique({ where: { email: session.user.email } })
        if (!user) return { message: "User not found" }

        // Check if pending request exists
        const existing = await prisma.accessRequest.findFirst({
            where: {
                userId: user.id,
                status: RequestStatus.PENDING
            }
        })

        if (existing) return { message: "You already have a pending request." }

        // We use the existing AccessRequest model. 
        // Note: 'requestedRole' is required by schema, but here we might just be requesting permissions.
        // We can default requestedRole to current role or keep it as is if not changing.
        // For simplicity, we set it to user's current role if not escalating.

        await prisma.accessRequest.create({
            data: {
                userId: user.id,
                requestedRole: user.role, // Keep same role
                requestedPermissions: validated.data.permissions,
                reason: validated.data.reason,
                status: RequestStatus.PENDING
            }
        })

        revalidatePath('/dashboard/profile')
        return { message: "Request submitted successfully!", success: true }
    } catch (e) {
        console.error(e)
        return { message: "Failed to submit request." }
    }
}
