
'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Role } from '@prisma/client'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
    LayoutDashboard,
    ShieldAlert,
    Settings,
    LogOut,
    Lock,
    Users
} from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { signOut } from 'next-auth/react' // Client side signout
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

interface SidebarProps {
    user: {
        name?: string | null
        email?: string | null
        image?: string | null
        role: Role
        permissions: string[]
    }
}

export function Sidebar({ user }: SidebarProps) {
    const pathname = usePathname()

    const navItems = [
        {
            label: 'Dashboard',
            icon: LayoutDashboard,
            href: '/dashboard',
            roles: [Role.VIEWER, Role.MANAGER, Role.ADMIN],
        },
        {
            label: 'Admin Requests',
            icon: ShieldAlert,
            href: '/admin/requests',
            roles: [Role.ADMIN], // Only Admin
        },
        {
            label: 'Manage Users',
            icon: Users,
            href: '/admin/users',
            roles: [Role.ADMIN],
        },
        // Example of a Manager only route (or shared)
        // { label: 'Settings', icon: Settings, href: '/settings', roles: [Role.Manager, Role.Admin] } 
    ]

    // Requirement: "disabled, not hidden, items for restricted actions"
    // So we show Admin Requests to everyone, but disable it if not Admin.

    const allNavItems = [
        {
            label: 'Dashboard',
            icon: LayoutDashboard,
            href: '/dashboard',
            allowed: true
        },
        {
            label: 'Access Requests',
            icon: ShieldAlert,
            href: '/admin/requests',
            allowed: user.role === Role.ADMIN || user.permissions.includes('MANAGE_USERS')
        },
        {
            label: 'Manage Users',
            icon: Users,
            href: '/admin/users',
            allowed: user.role === Role.ADMIN || user.permissions.includes('MANAGE_USERS')
        }
    ]

    return (
        <div className="flex h-screen w-64 flex-col border-r bg-sidebar text-sidebar-foreground">
            <div className="p-6 border-b border-sidebar-border">
                <h1 className="text-xl font-bold tracking-tight text-primary">Nexus Admin</h1>
                <p className="text-xs text-muted-foreground mt-1">Enterprise Portal</p>
            </div>

            <div className="flex-1 py-6 px-4 space-y-2">
                <TooltipProvider>
                    {allNavItems.map((item) => (
                        <div key={item.href}>
                            {item.allowed ? (
                                <Link href={item.href}>
                                    <Button
                                        variant={pathname === item.href ? 'secondary' : 'ghost'}
                                        className={cn("w-full justify-start", pathname === item.href && "font-semibold")}
                                    >
                                        <item.icon className="mr-2 h-4 w-4" />
                                        {item.label}
                                    </Button>
                                </Link>
                            ) : (
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            className="w-full justify-start opacity-50 cursor-not-allowed"
                                            disabled // Actually disabled prevents TooltipTrigger events in some versions, maybe use div wrapper if needed or just styling
                                        >
                                            <item.icon className="mr-2 h-4 w-4" />
                                            {item.label}
                                            <Lock className="ml-auto h-3 w-3" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Requires ADMIN role</p>
                                    </TooltipContent>
                                </Tooltip>
                            )}
                        </div>
                    ))}
                </TooltipProvider>
            </div>

            <div className="p-4 border-t border-sidebar-border">
                <div className="flex items-center gap-3 mb-4">
                    <Avatar>
                        <AvatarImage src={user.image || ''} />
                        <AvatarFallback>{user.name?.[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col overflow-hidden">
                        <span className="text-sm font-medium truncate">{user.name}</span>
                        <Badge variant="outline" className="w-fit text-[10px] px-1 py-0 h-4 border-primary/20 text-primary">
                            {user.role}
                        </Badge>
                    </div>
                </div>
                <Button
                    variant="outline"
                    className="w-full justify-start text-muted-foreground hover:text-destructive"
                    onClick={() => signOut({ callbackUrl: '/auth/signin' })}
                >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                </Button>
            </div>
        </div>
    )
}
