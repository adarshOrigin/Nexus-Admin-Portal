
'use server'

import { signIn } from "@/auth"
import { AuthError } from "next-auth"

export async function googleLogin() {
    await signIn("google", { redirectTo: "/dashboard" })
}

export async function credentialsLogin(prevState: string | undefined, formData: FormData) {
    try {
        await signIn("credentials", formData) // Redirects automatically on success
    } catch (error) {
        if (error instanceof AuthError) {
            switch (error.type) {
                case 'CredentialsSignin':
                    return 'Invalid credentials.'
                default:
                    return 'Something went wrong.'
            }
        }
        throw error
    }
}
