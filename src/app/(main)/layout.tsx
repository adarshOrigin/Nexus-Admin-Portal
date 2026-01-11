
import { auth } from "@/auth"
import { Sidebar } from "@/components/layout/sidebar"
import { TopNav } from "@/components/layout/top-nav"
import { Role } from "@prisma/client"
import { redirect } from "next/navigation"
import { Notifications } from "@/components/layout/notifications"

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
    const session = await auth()

    if (!session?.user) {
        return children // Should be handled by middleware/page, but safeguard
    }

    // Pass user data to Sidebar for RBAC
    const user = {
        name: session.user.name,
        email: session.user.email,
        image: session.user.image,
        role: (session.user as any).role as Role,
        permissions: (session.user as any).permissions as string[] || []
    }

    return (
        <div className="flex h-screen overflow-hidden bg-background">
            <Sidebar user={user} />
            <div className="flex flex-col flex-1 overflow-hidden">
                <TopNav user={user} />
                <Notifications />
                <main className="flex-1 overflow-y-auto p-6">
                    {children}
                </main>
            </div>
        </div>
    )
}
