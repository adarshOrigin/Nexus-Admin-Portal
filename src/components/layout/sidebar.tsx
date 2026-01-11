'use client'

import React from 'react'
import { Role } from '@prisma/client'
import { SidebarContent } from './sidebar-content'

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
    return (
        <div className="hidden md:flex h-screen w-64 flex-col border-r bg-sidebar text-sidebar-foreground">
           <SidebarContent user={user} />
        </div>
    )
}