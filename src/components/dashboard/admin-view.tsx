
import { prisma } from "@/lib/prisma"
import { LoanList } from "@/components/dashboard/loan-list"
import { StatsCard } from "@/components/dashboard/stats-card"
import { Role } from "@prisma/client"
import { FileText, Users, DollarSign, Activity } from "lucide-react"

export async function AdminDashboard({ userRole }: { userRole: Role }) {
    const [loans, totalLoans, pendingLoans, totalAmount] = await Promise.all([
        prisma.loanApplication.findMany({
            take: 20,
            orderBy: { createdAt: 'desc' }
        }),
        prisma.loanApplication.count(),
        prisma.loanApplication.count({ where: { status: 'PENDING' } }),
        prisma.loanApplication.aggregate({
            _sum: { amount: true }
        })
    ])

    return (
        <div className="space-y-8">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatsCard
                    title="Total Revenue"
                    value={`$${(totalAmount._sum.amount || 0).toLocaleString()}`}
                    icon={DollarSign}
                    trend="+20.1% from last month"
                />
                <StatsCard
                    title="Active Applications"
                    value={totalLoans}
                    icon={FileText}
                    description="Total loans processed"
                />
                <StatsCard
                    title="Pending Review"
                    value={pendingLoans}
                    icon={Activity}
                    description="Requires attention"
                />
                <StatsCard
                    title="Active Users"
                    value="24"
                    icon={Users}
                    description="+2 since last hour"
                />
            </div>

            <div className="space-y-4">
                <h2 className="text-xl font-semibold tracking-tight">Recent Applications</h2>
                <LoanList initialLoans={loans} userRole={userRole} />
            </div>
        </div>
    )
}
