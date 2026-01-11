
import { auth } from "@/auth"
import { Role } from "@prisma/client"
import { redirect } from "next/navigation"
import { AdminDashboard } from "@/components/dashboard/admin-view"
import { ViewerDashboard } from "@/components/dashboard/viewer-view"


export default async function DashboardPage(props: { searchParams?: Promise<{ [key: string]: string | string[] | undefined }> }) {
    const searchParams = await props.searchParams
    const query = typeof searchParams?.query === 'string' ? searchParams.query : ''
    const page = Number(searchParams?.page) || 1
    
    const session = await auth()

    if (!session?.user) {
        redirect("/auth/signin")
    }

    const userRole = (session.user as any).role as Role

    return (
        <div className="container mx-auto py-8 space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h1>
                    <p className="text-muted-foreground mt-1">
                        Welcome back, {session.user.name?.split(' ')[0] || 'User'}.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium bg-muted px-3 py-1 rounded-full text-muted-foreground">
                        {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </span>
                </div>
            </div>

            {(userRole === Role.ADMIN || userRole === Role.MANAGER) ? (
                <AdminDashboard userRole={userRole} query={query} currentPage={page} />
            ) : (
                <ViewerDashboard />
            )}
        </div>
    )
}
