'use client'

import { useActionState } from 'react'
import { requestFeatureAccess } from '@/actions/feature-request'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const AVAILABLE_FEATURES = [
    { id: 'MANAGE_USERS', label: 'Manage Users' },
    { id: 'APPROVE_LOANS', label: 'Approve Loans' },
    { id: 'VIEW_ANALYTICS', label: 'View Analytics' },
    { id: 'SYSTEM_SETTINGS', label: 'System Settings' },
]

export function FeatureRequestForm({ existingPermissions = [] }: { existingPermissions?: string[] }) {
    const [state, formAction, isPending] = useActionState(requestFeatureAccess, null)

    return (
        <Card>
            <CardHeader>
                <CardTitle>Request Feature Access</CardTitle>
                <CardDescription>Request access to specific system capabilities.</CardDescription>
            </CardHeader>
            <CardContent>
                <form action={formAction} className="space-y-6">
                    <div className="space-y-4">
                        <Label>Select Features</Label>
                        <div className="grid grid-cols-2 gap-4">
                            {AVAILABLE_FEATURES.map((feature) => {
                                const isOwned = existingPermissions.includes(feature.id)
                                return (
                                    <div key={feature.id} className="flex items-center space-x-2">
                                        <input
                                            type="checkbox"
                                            id={feature.id}
                                            name="permissions"
                                            value={feature.id}
                                            disabled={isOwned}
                                            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary disabled:opacity-50"
                                        />
                                        <label
                                            htmlFor={feature.id}
                                            className={`text-sm font-medium leading-none ${isOwned ? 'text-muted-foreground' : ''}`}
                                        >
                                            {feature.label} {isOwned && '(Owned)'}
                                        </label>
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="reason">Reason</Label>
                        <Textarea
                            id="reason"
                            name="reason"
                            placeholder="Why do you need these permissions?"
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
            </CardContent>
        </Card>
    )
}
