import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { ProfileForm } from "./profile-form"
import { EditProfileForm } from "./edit-profile-form"
import { FeatureRequestForm } from "./feature-request-form"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { redirect } from "next/navigation"

export default async function ProfilePage() {
    const session = await auth()

    if (!session?.user) {
        redirect("/auth/signin")
    }

    const dbUser = await (prisma.user as any).findUnique({
        where: { email: session.user.email! },
        select: {
            id: true,
            name: true,
            email: true,
            image: true,
            role: true,
            createdAt: true,
            permissions: true
        }
    })

    if (!dbUser) return <div>User not found</div>

    const pendingRequest = await prisma.accessRequest.findFirst({
        where: {
            userId: dbUser.id,
            status: "PENDING"
        }
    })

    const initials = dbUser.name
        ? dbUser.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()
        : 'U'

    const isAdmin = dbUser.role === 'ADMIN'

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <h2 className="text-3xl font-bold tracking-tight">Your Profile</h2>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <div className="col-span-3 space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Identity</CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-col items-center space-y-4">
                            <Avatar className="h-24 w-24">
                                <AvatarImage src={dbUser.image || ""} alt={dbUser.name || "User"} />
                                <AvatarFallback className="text-lg">{initials}</AvatarFallback>
                            </Avatar>
                            <div className="text-center">
                                <p className="text-sm text-muted-foreground">{dbUser.email}</p>
                                <p className="text-xs text-muted-foreground mt-1">Joined {dbUser.createdAt.toLocaleDateString()}</p>
                            </div>
                        </CardContent>
                    </Card>

                    <EditProfileForm initialName={dbUser.name || ""} />
                </div>

                <div className="col-span-4 space-y-6">
                    <ProfileForm
                        userRole={dbUser.role}
                        hasPendingRequest={!!pendingRequest}
                    />
                    {!isAdmin && (
                        <FeatureRequestForm existingPermissions={dbUser.permissions} />
                    )}
                </div>
            </div>
        </div>
    )
}
