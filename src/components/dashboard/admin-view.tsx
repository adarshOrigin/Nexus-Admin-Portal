import { prisma } from "@/lib/prisma"
import { LoanList } from "@/components/dashboard/loan-list"
import { StatsCard } from "@/components/dashboard/stats-card"
import { AnalyticsCharts } from "@/components/dashboard/analytics-charts"
import { SearchInput } from "@/components/ui/search-input"
import { PaginationControls } from "@/components/ui/pagination-controls"
import { Role } from "@prisma/client"
import { FileText, Users, DollarSign, Activity } from "lucide-react"

export async function AdminDashboard({ userRole, query, currentPage }: { userRole: Role, query: string, currentPage: number }) {
    const ITEMS_PER_PAGE = 10
    const skip = (currentPage - 1) * ITEMS_PER_PAGE

    const where = query ? {
        OR: [
            { applicantName: { contains: query, mode: 'insensitive' as const } }
        ]
    } : {}

    const [
        loans,
        totalLoansCount,
        totalLoans,
        pendingLoans,
        totalAmount,
        statusDistribution,
        recentActivityRaw
    ] = await Promise.all([
        prisma.loanApplication.findMany({
            where,
            take: ITEMS_PER_PAGE,
            skip,
            orderBy: { createdAt: 'desc' }
        }),
        prisma.loanApplication.count({ where }),
        prisma.loanApplication.count(),
        prisma.loanApplication.count({ where: { status: 'PENDING' } }),
        prisma.loanApplication.aggregate({
            _sum: { amount: true }
        }),
        prisma.loanApplication.groupBy({
            by: ['status'],
            _count: { status: true }
        }),
        prisma.loanApplication.findMany({
            take: 50,
            orderBy: { createdAt: 'desc' },
            select: { createdAt: true, amount: true }
        })
    ])

    const totalPages = Math.ceil(totalLoansCount / ITEMS_PER_PAGE)

    // Process data for charts
    const statusColors: Record<string, string> = {
        APPROVED: '#22c55e', // green-500
        REJECTED: '#ef4444', // red-500
        PENDING: '#eab308',  // yellow-500
        IN_REVIEW: '#3b82f6' // blue-500
    }

    const loansByStatus = statusDistribution.map(item => ({
        name: item.status,
        value: item._count.status,
        color: statusColors[item.status] || '#94a3b8'
    }))

    // Aggregate daily volume for the last 7 days from recentActivityRaw
    // Initialize last 7 days map
    const last7DaysMap = new Map<string, number>()
    for (let i = 6; i >= 0; i--) {
        const d = new Date()
        d.setDate(d.getDate() - i)
        last7DaysMap.set(d.toLocaleDateString(), 0)
    }

    recentActivityRaw.forEach(loan => {
        const dateStr = loan.createdAt.toLocaleDateString()
        if (last7DaysMap.has(dateStr)) {
            last7DaysMap.set(dateStr, (last7DaysMap.get(dateStr) || 0) + loan.amount)
        }
    })

    const recentActivity = Array.from(last7DaysMap.entries()).map(([date, amount]) => ({
        date: date.slice(0, 5), // Shorten date "12/05"
        amount
    }))

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

            <AnalyticsCharts loansByStatus={loansByStatus} recentActivity={recentActivity} />

            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold tracking-tight">Recent Applications</h2>
                    <SearchInput placeholder="Search applicants..." />
                </div>
                
                <LoanList initialLoans={loans} userRole={userRole} />
                
                <PaginationControls totalPages={totalPages} currentPage={currentPage} />
            </div>
        </div>
    )
}