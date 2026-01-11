
'use client'

import { LoanApplication, Role } from "@prisma/client"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AccessRequestModal } from "@/components/access-request-modal"
import { approveLoan, rejectLoan } from "@/actions/loan-actions"
import { useState } from "react"
import { toast } from "sonner" // Using Sonner instead of 'use-toast'
import { CheckCircle2, XCircle, AlertCircle } from "lucide-react"

interface LoanListProps {
    initialLoans: LoanApplication[]
    userRole: Role
}

export function LoanList({ initialLoans, userRole }: LoanListProps) {
    return (
        <div className="rounded-xl border shadow-sm bg-card">
            <Table>
                <TableHeader>
                    <TableRow className="hover:bg-muted/50">
                        <TableHead className="w-[200px]">Applicant</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Credit Score</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {initialLoans.map((loan) => (
                        <TableRow key={loan.id} className="hover:bg-muted/50 transition-colors">
                            <TableCell className="font-semibold text-foreground">{loan.applicantName}</TableCell>
                            <TableCell className="font-mono text-muted-foreground">${loan.amount.toLocaleString()}</TableCell>
                            <TableCell>
                                <div className="flex items-center gap-2">
                                    <span className={`h-2 w-2 rounded-full ${loan.creditScore > 700 ? 'bg-green-500' : loan.creditScore > 600 ? 'bg-yellow-500' : 'bg-red-500'}`} />
                                    {loan.creditScore}
                                </div>
                            </TableCell>
                            <TableCell>
                                <Badge
                                    variant="outline"
                                    className={
                                        loan.status === 'APPROVED' ? 'border-green-200 text-green-700 bg-green-50/50' :
                                            loan.status === 'REJECTED' ? 'border-red-200 text-red-700 bg-red-50/50' :
                                                'border-yellow-200 text-yellow-700 bg-yellow-50/50'
                                    }
                                >
                                    {loan.status}
                                </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                                {loan.status === 'PENDING' && (
                                    <div className="flex justify-end gap-2">
                                        <ActionButton
                                            action={() => approveLoan(loan.id)}
                                            userRole={userRole}
                                            label="Approve"
                                            variant="default"
                                            loanId={loan.id}
                                            type="approve"
                                        />
                                        <ActionButton
                                            action={() => rejectLoan(loan.id)}
                                            userRole={userRole}
                                            label="Reject"
                                            variant="outline"
                                            loanId={loan.id}
                                            type="reject"
                                        />
                                    </div>
                                )}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}

function ActionButton({ action, userRole, label, variant, loanId, type }: { action: () => Promise<any>, userRole: Role, label: string, variant: "default" | "destructive" | "outline", loanId: string, type: 'approve' | 'reject' }) {
    const isViewer = userRole === Role.VIEWER
    const [loading, setLoading] = useState(false)

    const handleClick = async () => {
        if (!isViewer) {
            setLoading(true)
            const promise = action()

            toast.promise(promise, {
                loading: type === 'approve' ? 'Approving loan...' : 'Rejecting loan...',
                success: (data) => {
                    setLoading(false)
                    if (data.success) return `Loan ${type === 'approve' ? 'approved' : 'rejected'} successfully`
                    throw new Error(data.message || 'Failed')
                },
                error: (err) => {
                    setLoading(false)
                    return err.message
                }
            })
            await promise
            setLoading(false)
        }
    }

    if (isViewer) {
        return (
            <AccessRequestModal>
                <Button
                    variant={variant}
                    size="sm"
                    className={type === 'approve' ? "bg-indigo-600 hover:bg-indigo-700 text-white" : ""}
                >
                    {label}
                </Button>
            </AccessRequestModal>
        )
    }

    return (
        <Button
            variant={variant}
            size="sm"
            onClick={handleClick}
            disabled={loading}
            className={type === 'approve' && variant === 'default' ? "bg-indigo-600 hover:bg-indigo-700 text-white" : ""}
        >
            {label}
        </Button>
    )
}
