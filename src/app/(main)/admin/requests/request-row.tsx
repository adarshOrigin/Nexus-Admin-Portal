
'use client'

import { approveAccessRequest, rejectAccessRequest } from "@/actions/admin-actions"
import { Button } from "@/components/ui/button"
import { AccessRequest } from "@prisma/client"
import { TableCell, TableRow } from "@/components/ui/table"
import { useState } from "react"
import { Badge } from "@/components/ui/badge"
// Confirmation dialog components can be added here if needed, 
// for now simple buttons as requested "decisive". 
// Prompt said "using confirmation dialogs".
// Let's add simple native confirm or shadcn Dialog. Native is faster for decisive admin actions if not destructive.
// But "confirmation dialogs" implies UI.
// I'll stick to direct action for speed in this demo unless requested otherwise? 
// Prompt: "using confirmation dialogs". Okay, I should add them.

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface AdminRequestRowProps {
    request: AccessRequest & { user: { name: string | null, email: string | null, role: string } }
}

export function AdminRequestRow({ request }: AdminRequestRowProps) {
    const [loading, setLoading] = useState(false)
    const isRoleChange = request.requestedRole !== request.user.role

    const handleApprove = async () => {
        setLoading(true)
        await approveAccessRequest(request.id)
        setLoading(false)
    }

    const handleReject = async () => {
        setLoading(true)
        await rejectAccessRequest(request.id)
        setLoading(false)
    }

    return (
        <TableRow>
            <TableCell className="font-medium">{request.user.name ?? 'Unknown'}</TableCell>
            <TableCell>{request.user.email}</TableCell>
            <TableCell>
                {isRoleChange ? (
                    <Badge variant="outline" className="border-blue-200 text-blue-700 bg-blue-50">
                        {request.requestedRole}
                    </Badge>
                ) : (
                    <span className="text-muted-foreground text-sm">-</span>
                )}
            </TableCell>
            <TableCell>
                <div className="flex flex-wrap gap-1">
                    {request.requestedPermissions.length > 0 ? (
                        request.requestedPermissions.map((perm) => (
                            <Badge key={perm} variant="secondary" className="text-xs">
                                {perm}
                            </Badge>
                        ))
                    ) : (
                        <span className="text-muted-foreground text-sm">-</span>
                    )}
                </div>
            </TableCell>
            <TableCell className="max-w-xs truncate" title={request.reason}>{request.reason}</TableCell>
            <TableCell className="text-right space-x-2">
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button
                            variant="default"
                            size="sm"
                            className="bg-green-600 hover:bg-green-700 h-8"
                            disabled={loading}
                        >
                            Approve
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Approve Request?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This will upgrade {request.user.email} to {request.requestedRole}.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleApprove} className="bg-green-600 hover:bg-green-700">Confirm Approve</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>

                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button
                            variant="destructive"
                            size="sm"
                            className="h-8"
                            disabled={loading}
                        >
                            Reject
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Reject Request?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This will deny the request. The user will remain in their current role.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleReject} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Confirm Reject</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </TableCell>
        </TableRow>
    )
}
