'use client'

import React, { useState } from 'react'
import { Bell, Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { usePathname } from 'next/navigation'

import { UserNav } from '@/components/layout/user-nav'
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { SidebarContent } from './sidebar-content'
import { Role } from '@prisma/client'

interface TopNavProps {
    user: {
        name?: string | null
        email?: string | null
        image?: string | null
        role: Role
        permissions: string[]
    }
}

export function TopNav({ user }: TopNavProps) {
    const pathname = usePathname()
    const segments = pathname.split('/').filter(Boolean)
    const [open, setOpen] = useState(false)

    return (
        <header className="flex h-14 items-center gap-4 border-b bg-background px-4 md:px-6">
            <Sheet open={open} onOpenChange={setOpen}>
                <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="md:hidden shrink-0">
                        <Menu className="h-5 w-5" />
                        <span className="sr-only">Toggle menu</span>
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0 w-72">
                    <SidebarContent user={user} onNavigate={() => setOpen(false)} />
                </SheetContent>
            </Sheet>

            <div className="flex-1 overflow-hidden">
                <Breadcrumb className="hidden sm:block">
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <BreadcrumbLink href="/dashboard">Home</BreadcrumbLink>
                        </BreadcrumbItem>
                        {segments.map((segment, index) => {
                            const isLast = index === segments.length - 1
                            const href = `/${segments.slice(0, index + 1).join('/')}`
                            return (
                                <React.Fragment key={href}>
                                    <BreadcrumbSeparator />
                                    <BreadcrumbItem>
                                        {isLast ? (
                                            <BreadcrumbPage className="capitalize truncate max-w-[100px] sm:max-w-none">
                                                {segment}
                                            </BreadcrumbPage>
                                        ) : (
                                            <BreadcrumbLink href={href} className="capitalize hidden sm:inline-block">
                                                {segment}
                                            </BreadcrumbLink>
                                        )}
                                    </BreadcrumbItem>
                                </React.Fragment>
                            )
                        })}
                    </BreadcrumbList>
                </Breadcrumb>
                {/* Mobile Breadcrumb (Simplified) */}
                 <div className="sm:hidden text-sm font-medium capitalize truncate">
                    {segments[segments.length - 1] || 'Dashboard'}
                </div>
            </div>

            <div className="flex items-center gap-2">
                <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground relative"
                    onClick={() => toast.info("No new notifications")}
                >
                    <Bell className="h-5 w-5" />
                    <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-background" />
                    <span className="sr-only">Notifications</span>
                </Button>
                <UserNav user={user} />
            </div>
        </header>
    )
}