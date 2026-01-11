
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { Role } from "@prisma/client"
import { redirect } from "next/navigation"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { AdminRequestRow } from "./request-row" // Renamed from Item to Row for clarity

export default async function AdminRequestsPage() {
    const session = await auth()
    if (!session?.user) redirect("/auth/signin")

    const role = (session.user as any).role as Role
    const permissions = (session.user as any).permissions as string[] || []

    if (role !== 'ADMIN' && !permissions.includes('MANAGE_USERS')) redirect("/dashboard")

    const requests = await prisma.accessRequest.findMany({
        where: { status: 'PENDING' },
        include: { user: true },
        orderBy: { createdAt: 'desc' }
    })

    return (
        <div className="container mx-auto py-10">
            <h1 className="text-3xl font-bold mb-8">Access Requests</h1>

            {requests.length === 0 ? (
                <p className="text-gray-500">No pending requests.</p>
            ) : (
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>User</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Requested Role</TableHead>
                                <TableHead>Permissions</TableHead>
                                <TableHead>Reason</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {requests.map(req => (
                                <AdminRequestRow key={req.id} request={req} />
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}
        </div>
    )
}
