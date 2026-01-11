
import { PrismaClient, Role, RequestStatus } from '@prisma/client'
import { faker } from '@faker-js/faker'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    console.log('🌱 Starting seed...')

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
    console.log(`Created Admin: ${admin.email}`)

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
    console.log(`Created Manager: ${manager.email}`)

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
    console.log(`Created Viewer: ${viewer.email}`)

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
    console.log(`Created ${users.length} random users`)

    // 5. Generate Access Requests
    const pendingRequests = []
    for (let i = 0; i < 20; i++) {
        // Pick a random user who is a VIEWER
        const viewerUsers = users.filter(u => u.role === Role.VIEWER)
        if (viewerUsers.length === 0) break;

        const randomUser = faker.helpers.arrayElement(viewerUsers)

        // Check if we already created a request for this user in this loop to avoid errors if unique constraints existed (none here, but good practice)

        await prisma.accessRequest.create({
            data: {
                userId: randomUser.id,
                requestedRole: Role.MANAGER,
                reason: faker.lorem.sentence(),
                status: RequestStatus.PENDING,
            },
        })
    }
    console.log(`Created 20 pending access requests`)

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
            },
        })
    }
    console.log(`Created 150 loan applications`)

    console.log('✅ Seeding finished.')
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
