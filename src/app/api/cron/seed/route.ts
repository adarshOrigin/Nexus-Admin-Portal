
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Role, RequestStatus } from '@prisma/client'
import { faker } from '@faker-js/faker'
import bcrypt from 'bcryptjs'

export const dynamic = 'force-dynamic' // Ensure it's not cached

export async function GET(request: Request) {
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return new NextResponse('Unauthorized', { status: 401 })
    }

    try {
        console.log('🌱 Starting scheduled reseed...')

        // Cleanup existing data
        await prisma.loanApplication.deleteMany()
        await prisma.accessRequest.deleteMany()
        await prisma.account.deleteMany()
        await prisma.session.deleteMany()
        await prisma.user.deleteMany()

        const hashedPassword = await bcrypt.hash('password123', 10)

        // 1. Create Admin User
        const admin = await prisma.user.create({
            data: {
                name: 'Admin User',
                email: 'admin@nexus.com',
                password: hashedPassword,
                role: Role.ADMIN,
                image: faker.image.avatar(),
            },
        })

        // 2. Create Manager User
        const manager = await prisma.user.create({
            data: {
                name: 'Manager User',
                email: 'manager@nexus.com',
                password: hashedPassword,
                role: Role.MANAGER,
                image: faker.image.avatar(),
            },
        })

        // 3. Create Viewer User (Standard)
        const viewer = await prisma.user.create({
            data: {
                name: 'Viewer User',
                email: 'viewer@nexus.com',
                password: hashedPassword,
                role: Role.VIEWER,
                image: faker.image.avatar(),
            },
        })

        // 4. Generate Random Users
        const users = []
        for (let i = 0; i < 20; i++) {
            const role = faker.helpers.arrayElement([Role.VIEWER, Role.MANAGER])
            const user = await prisma.user.create({
                data: {
                    name: faker.person.fullName(),
                    email: faker.internet.email().toLowerCase(),
                    password: hashedPassword,
                    role: role,
                    image: faker.image.avatar(),
                },
            })
            users.push(user)
        }

        // 5. Generate Access Requests
        for (let i = 0; i < 20; i++) {
            const viewerUsers = users.filter(u => u.role === Role.VIEWER)
            if (viewerUsers.length === 0) break;

            const randomUser = faker.helpers.arrayElement(viewerUsers)
            
            // Basic check to avoid duplicates in loop (though DB clean makes this less risky)
            const existing = await prisma.accessRequest.findFirst({ where: { userId: randomUser.id } })
            if (existing) continue;

            await prisma.accessRequest.create({
                data: {
                    userId: randomUser.id,
                    requestedRole: Role.MANAGER,
                    reason: faker.lorem.sentence(),
                    status: RequestStatus.PENDING,
                },
            })
        }

        // 6. Generate Loan Applications
        const allUsers = [admin, manager, viewer, ...users]
        for (let i = 0; i < 150; i++) {
            const assignedUser = Math.random() > 0.5 ? faker.helpers.arrayElement(allUsers) : null

            await prisma.loanApplication.create({
                data: {
                    applicantName: faker.person.fullName(),
                    amount: parseFloat(faker.finance.amount({ min: 1000, max: 50000 })),
                    creditScore: faker.number.int({ min: 300, max: 850 }),
                    status: faker.helpers.arrayElement(['PENDING', 'APPROVED', 'REJECTED', 'IN_REVIEW']),
                    assignedToId: assignedUser?.id,
                    // Simulate dates over last 30 days
                    createdAt: faker.date.recent({ days: 30 })
                },
            })
        }

        console.log('✅ Scheduled reseed finished.')
        return NextResponse.json({ success: true, message: 'Database reseeded successfully.' })
    } catch (error) {
        console.error('Reseed failed:', error)
        return NextResponse.json({ success: false, error: 'Reseed failed' }, { status: 500 })
    }
}
