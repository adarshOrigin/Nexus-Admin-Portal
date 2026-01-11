
'use server'

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { Role, RequestStatus } from "@prisma/client"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const requestSchema = z.object({
    reason: z.string().min(10, "Reason must be at least 10 characters"),
    role: z.nativeEnum(Role),
})

export async function submitAccessRequest(prevState: any, formData: FormData) {
    const session = await auth()
    if (!session?.user?.email) return { message: "Not authenticated" }

    const reason = formData.get("reason") as string
    const role = formData.get("role") as Role

    const validated = requestSchema.safeParse({ reason, role })

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

        await prisma.accessRequest.create({
            data: {
                userId: user.id,
                requestedRole: validated.data.role,
                reason: validated.data.reason,
                status: RequestStatus.PENDING
            }
        })

        revalidatePath('/dashboard')
        return { message: "Request submitted successfully!", success: true }
    } catch (e) {
        console.error(e)
        return { message: "Failed to submit request." }
    }
}
