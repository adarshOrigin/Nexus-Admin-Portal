
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Lock } from "lucide-react"
import Link from "next/link"

export async function ViewerDashboard() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-6">
            <Card className="w-full max-w-md text-center">
                <CardHeader>
                    <div className="flex justify-center mb-4">
                        <div className="p-3 bg-muted rounded-full">
                            <Lock className="h-8 w-8 text-muted-foreground" />
                        </div>
                    </div>
                    <CardTitle className="text-2xl">Limited Access</CardTitle>
                    <CardDescription>
                        You are currently viewing this portal as a <strong>Viewer</strong>.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                        Viewers have read-only access to their own profile and basic information.
                        To view loan applications, manage users, or perform administrative actions,
                        you need to request a role upgrade.
                    </p>
                    <Link href="/dashboard/profile">
                        <Button className="w-full" variant="default">
                            Request Access Upgrade
                        </Button>
                    </Link>
                </CardContent>
            </Card>
        </div>
    )
}
