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
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { UserEditDialog } from "@/components/admin/user-edit-dialog"
import { SearchInput } from "@/components/ui/search-input"
import { PaginationControls } from "@/components/ui/pagination-controls"

export default async function UsersPage(props: { searchParams?: Promise<{ [key: string]: string | string[] | undefined }> }) {
    const searchParams = await props.searchParams
    const query = typeof searchParams?.query === 'string' ? searchParams.query : ''
    const page = Number(searchParams?.page) || 1
    const ITEMS_PER_PAGE = 10
    const skip = (page - 1) * ITEMS_PER_PAGE

    const session = await auth()
    if (!session?.user) redirect("/auth/signin")

    // Authorization Check
    const currentUser = await prisma.user.findUnique({
        where: { email: session.user.email! },
        select: { role: true, permissions: true }
    })

    if (currentUser?.role !== Role.ADMIN && !currentUser?.permissions.includes('MANAGE_USERS')) {
        redirect("/dashboard")
    }

    const where = query ? {
        OR: [
            { name: { contains: query, mode: 'insensitive' as const } },
            { email: { contains: query, mode: 'insensitive' as const } }
        ]
    } : {}

    const [users, totalUsers] = await Promise.all([
        (prisma.user as any).findMany({
            where,
            orderBy: { createdAt: 'desc' },
            skip,
            take: ITEMS_PER_PAGE,
            select: {
                id: true,
                name: true,
                email: true,
                image: true,
                role: true,
                permissions: true,
                createdAt: true
            }
        }),
        prisma.user.count({ where })
    ])

    const totalPages = Math.ceil(totalUsers / ITEMS_PER_PAGE)

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
                    <p className="text-muted-foreground">Manage roles and permissions for all users.</p>
                </div>
                <SearchInput placeholder="Search users..." />
            </div>

            <div className="border rounded-md">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>User</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Permissions</TableHead>
                            <TableHead>Joined</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users.map((user: any) => {
                            // Cast permissions to any because of TS type sync issues
                            const perms = (user as any).permissions as string[] || []

                            return (
                                <TableRow key={user.id}>
                                    <TableCell className="flex items-center gap-3">
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage src={user.image || ""} />
                                            <AvatarFallback>{user.name?.[0]}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex flex-col">
                                            <span className="font-medium">{user.name}</span>
                                            <span className="text-xs text-muted-foreground">{user.email}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={
                                            user.role === 'ADMIN' ? 'destructive' :
                                                user.role === 'MANAGER' ? 'default' : 'secondary'
                                        }>
                                            {user.role}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-wrap gap-1">
                                            {perms.length > 0 ? perms.map((p) => (
                                                <Badge key={p} variant="outline" className="text-[10px]">
                                                    {p.replace('_', ' ')}
                                                </Badge>
                                            )) : (
                                                <span className="text-muted-foreground text-xs italic">None</span>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground text-sm">
                                        {user.createdAt.toLocaleDateString()}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <UserEditDialog user={{
                                            ...user,
                                            permissions: perms
                                        }} />
                                    </TableCell>
                                </TableRow>
                            )
                        })}
                    </TableBody>
                </Table>
            </div>
            <PaginationControls totalPages={totalPages} currentPage={page} />
        </div>
    )
}