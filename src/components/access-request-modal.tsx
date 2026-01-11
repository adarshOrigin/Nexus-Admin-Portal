
'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea" // Need to add textarea
import { Role } from "@prisma/client"
import { submitAccessRequest } from "@/actions/access-request"
import { useActionState } from 'react'

export function AccessRequestModal({ children }: { children: React.ReactNode }) {
    const [open, setOpen] = useState(false)
    const [state, formAction, isPending] = useActionState(submitAccessRequest, null)

    // Close dialog on success
    if (state?.success && open) {
        setOpen(false)
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Request Access Upgrade</DialogTitle>
                    <DialogDescription>
                        You need additional permissions to perform this action. Request an upgrade below.
                    </DialogDescription>
                </DialogHeader>
                <form action={formAction} className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="role" className="text-right">
                            Role
                        </Label>
                        <Input id="role" name="role" value={Role.MANAGER} readOnly className="col-span-3 bg-gray-100" />
                        {/* Hardcoded to MANAGER for now, could be dynamic */}
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="reason" className="text-right">
                            Reason
                        </Label>
                        <Textarea
                            id="reason"
                            name="reason"
                            placeholder="Why do you need this access?"
                            className="col-span-3"
                            required
                        />
                    </div>
                    {state?.message && (
                        <p className={`text-sm ${state.success ? 'text-green-600' : 'text-red-500'}`}>{state.message}</p>
                    )}
                    <DialogFooter>
                        <Button type="submit" disabled={isPending}>
                            {isPending ? 'Submitting...' : 'Submit Request'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
