'use client'

import { useEffect } from "react"
import { checkUnreadApprovals, markNotificationAsRead } from "@/actions/notification-actions"
import { useSession } from "next-auth/react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export function Notifications() {
    const { update } = useSession()
    const router = useRouter()

    useEffect(() => {
        const check = async () => {
            const approvals = await checkUnreadApprovals()
            if (approvals && approvals.length > 0) {
                // Determine what to show
                let updated = false
                const idsToObject: string[] = []

                approvals.forEach(approval => {
                    idsToObject.push(approval.id)
                    let message = ""
                    if (approval.requestedPermissions.length > 0) {
                        message = `Permissions granted: ${approval.requestedPermissions.join(", ")}`
                    } else {
                        message = `Role updated to ${approval.requestedRole}`
                    }
                    toast.success("Access Request Approved", {
                        description: message,
                        duration: 5000,
                    })
                })

                // Mark as read
                await markNotificationAsRead(idsToObject)

                // Refresh session to apply new permissions
                await update()
                router.refresh()
            }
        }

        check()
    }, [update, router])

    return null
}
