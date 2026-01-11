'use server'

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const profileSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
})

export async function updateProfile(prevState: any, formData: FormData) {
    const session = await auth()
    if (!session?.user?.email) return { message: "Not authenticated" }

    const name = formData.get("name") as string

    const validated = profileSchema.safeParse({ name })

    if (!validated.success) {
        return { message: "Invalid input", errors: validated.error.flatten().fieldErrors }
    }

    try {
        await prisma.user.update({
            where: { email: session.user.email },
            data: { name: validated.data.name }
        })

        revalidatePath('/dashboard/profile')
        return { message: "Profile updated successfully!", success: true }
    } catch (e) {
        console.error(e)
        return { message: "Failed to update profile." }
    }
}
