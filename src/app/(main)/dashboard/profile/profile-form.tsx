'use client'

import { useActionState } from 'react'
import { submitAccessRequest } from '@/actions/access-request'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2 } from 'lucide-react'

export function ProfileForm({ userRole, hasPendingRequest }: { userRole: string, hasPendingRequest: boolean }) {
    const [state, formAction, isPending] = useActionState(submitAccessRequest, null)

    if (userRole === 'ADMIN' || userRole === 'MANAGER') {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Role Status</CardTitle>
                    <CardDescription>Your current permissions level.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">Current Role:</span>
                        <Badge variant="default" className="bg-indigo-600 hover:bg-indigo-700">{userRole}</Badge>
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Request Role Upgrade</CardTitle>
                <CardDescription>Need more permissions? Request an upgrade to Manager.</CardDescription>
            </CardHeader>
            <CardContent>
                {hasPendingRequest ? (
                    <div className="flex items-center gap-2 p-4 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 rounded-md border border-yellow-200 dark:border-yellow-800">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-sm font-medium">You have a pending request under review.</span>
                    </div>
                ) : (
                    <form action={formAction} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="role">Requested Role</Label>
                            <select
                                name="role"
                                defaultValue="MANAGER"
                                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <option value="MANAGER">Manager</option>
                                <option value="ADMIN">Admin</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="reason">Reason for Request</Label>
                            <Textarea
                                id="reason"
                                name="reason"
                                placeholder="I need access to manage loan applications..."
                                required
                                minLength={10}
                            />
                        </div>

                        {state?.message && (
                            <p className={`text-sm ${state.success ? 'text-green-600' : 'text-red-600'}`}>
                                {state.message}
                            </p>
                        )}

                        <Button type="submit" disabled={isPending}>
                            {isPending ? 'Submitting...' : 'Submit Request'}
                        </Button>
                    </form>
                )}
            </CardContent>
        </Card>
    )
}
