
'use client'

import { approveAccessRequest, rejectAccessRequest } from "@/actions/admin-actions"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { AccessRequest, Role } from "@prisma/client"
import { useState } from "react"

interface AdminRequestItemProps {
    request: AccessRequest & { user: { name: string | null, email: string | null } }
}

export function AdminRequestItem({ request }: AdminRequestItemProps) {
    const [loading, setLoading] = useState(false)

    const handleApprove = async () => {
        setLoading(true)
        await approveAccessRequest(request.id) // Ignores return value
        setLoading(false)
    }

    const handleReject = async () => {
        setLoading(true)
        await rejectAccessRequest(request.id)
        setLoading(false)
    }

    return (
        <Card className="p-6 flex items-center justify-between">
            <div>
                <h3 className="font-bold text-lg">{request.user.name ?? 'Unknown'} ({request.user.email})</h3>
                <p className="text-sm">Current Request: <span className="font-semibold text-blue-600">Upgrade to {request.requestedRole}</span></p>
                <p className="text-sm text-gray-500 mt-1">Reason: {request.reason}</p>
            </div>
            <div className="flex gap-2">
                <Button
                    variant="default"
                    className="bg-green-600 hover:bg-green-700"
                    onClick={handleApprove}
                    disabled={loading}
                >
                    Approve
                </Button>
                <Button
                    variant="destructive"
                    onClick={handleReject}
                    disabled={loading}
                >
                    Reject
                </Button>
            </div>
        </Card>
    )
}
