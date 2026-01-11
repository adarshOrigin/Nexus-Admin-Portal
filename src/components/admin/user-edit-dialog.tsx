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
import { Role } from "@prisma/client"
import { updateUser } from '@/actions/user-management'
import { toast } from 'sonner'
import { Pencil } from 'lucide-react'

// Reuse from feature request
const AVAILABLE_FEATURES = [
    { id: 'MANAGE_USERS', label: 'Manage Users' },
    { id: 'APPROVE_LOANS', label: 'Approve Loans' },
    { id: 'VIEW_ANALYTICS', label: 'View Analytics' },
    { id: 'SYSTEM_SETTINGS', label: 'System Settings' },
]

interface UserEditDialogProps {
    user: {
        id: string
        name: string | null
        email: string
        role: Role
        permissions: string[]
    }
}

export function UserEditDialog({ user }: UserEditDialogProps) {
    const [open, setOpen] = useState(false)
    const [role, setRole] = useState<Role>(user.role)
    const [permissions, setPermissions] = useState<string[]>(user.permissions)
    const [isSaving, setIsSaving] = useState(false)

    const handlePermissionChange = (featureId: string, checked: boolean) => {
        if (checked) {
            setPermissions([...permissions, featureId])
        } else {
            setPermissions(permissions.filter(p => p !== featureId))
        }
    }

    const handleSave = async () => {
        setIsSaving(true)
        const result = await updateUser(user.id, { role, permissions })
        setIsSaving(false)

        if (result.success) {
            toast.success("User updated successfully")
            setOpen(false)
        } else {
            toast.error(result.error || "Failed to update user")
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                    <Pencil className="h-4 w-4 mr-2" />
                    Edit
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Edit User</DialogTitle>
                    <DialogDescription>
                        Make changes to {user.name}'s role and permissions.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">
                            Name
                        </Label>
                        <Input id="name" value={user.name || ''} disabled className="col-span-3" />
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="role" className="text-right">
                            Role
                        </Label>
                        <div className="col-span-3">
                            <select
                                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                value={role}
                                onChange={(e) => setRole(e.target.value as Role)}
                            >
                                <option value="VIEWER">Viewer</option>
                                <option value="MANAGER">Manager</option>
                                <option value="ADMIN">Admin</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-4 items-start gap-4">
                        <Label className="text-right pt-2">
                            Access
                        </Label>
                        <div className="col-span-3 space-y-2">
                            {AVAILABLE_FEATURES.map((feature) => (
                                <div key={feature.id} className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        id={`edit-${user.id}-${feature.id}`}
                                        checked={permissions.includes(feature.id)}
                                        onChange={(e) => handlePermissionChange(feature.id, e.target.checked)}
                                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                    />
                                    <label
                                        htmlFor={`edit-${user.id}-${feature.id}`}
                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                    >
                                        {feature.label}
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                    <Button type="submit" onClick={handleSave} disabled={isSaving}>
                        {isSaving ? "Saving..." : "Save changes"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
