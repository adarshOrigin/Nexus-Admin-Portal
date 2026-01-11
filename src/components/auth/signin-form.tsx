
'use client'

import { useState, useEffect } from 'react'
import { googleLogin, credentialsLogin } from '@/lib/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ShieldCheck } from 'lucide-react'

export function SigninForm() {
    const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined)
    const [isPending, setIsPending] = useState(false)
    const [activeTab, setActiveTab] = useState("google")

    async function handleSubmit(formData: FormData) {
        setIsPending(true)
        setErrorMessage(undefined)

        try {
            const result = await credentialsLogin(undefined, formData)

            if (result) {
                // If a string is returned, it's an error message
                setErrorMessage(result)
                setActiveTab("credentials")
            } else {
                // If nothing is returned, it means success (signIn usually throws redirect, but if we catch it or if it returns void)
                // Actually, if signIn throws redirect, credentialsLogin might re-throw it.
                // Let's rely on client-side router for clean UX if server redirect somehow fails hydration.
                // Refetching session might be needed, but hard navigation is safest here.
                window.location.href = '/dashboard'
            }
        } catch (error) {
            // If credentialsLogin throws (e.g. redirect), let's check. 
            // Server actions that redirect throw an error NEXT_REDIRECT.
            // If we are here, it might be that.
            window.location.href = '/dashboard'
        } finally {
            setIsPending(false)
        }
    }

    useEffect(() => {
        if (errorMessage) {
            setActiveTab("credentials")
        }
    }, [errorMessage])

    return (
        <Card className="w-full max-w-md shadow-lg border-t-4 border-t-primary">
            <CardHeader className="text-center space-y-1">
                <div className="flex justify-center mb-2">
                    <ShieldCheck className="h-10 w-10 text-primary" />
                </div>
                <CardTitle className="text-2xl font-bold tracking-tight">Nexus Admin Portal</CardTitle>
                <CardDescription>Secure Gateway Login</CardDescription>
            </CardHeader>
            <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-6">
                        <TabsTrigger value="google">SSO / Google</TabsTrigger>
                        <TabsTrigger value="credentials">Credentials</TabsTrigger>
                    </TabsList>

                    <TabsContent value="google" className="space-y-4">
                        <div className="flex flex-col gap-4 py-6 text-center">
                            <p className="text-sm text-muted-foreground mb-2">Use your corporate Google account for single sign-on.</p>
                            <form action={googleLogin}>
                                <Button className="w-full" size="lg" type="submit">
                                    Sign in with Google
                                </Button>
                            </form>
                        </div>
                    </TabsContent>

                    <TabsContent value="credentials">
                        <form action={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" name="email" type="email" placeholder="user@nexus.com" defaultValue="viewer@nexus.com" required className="h-10" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <Input id="password" name="password" type="password" defaultValue="password123" required className="h-10" />
                            </div>
                            {errorMessage && <p className="text-sm text-destructive font-medium bg-destructive/10 p-2 rounded">{errorMessage}</p>}
                            <Button className="w-full mt-2" size="lg" type="submit" disabled={isPending}>
                                {isPending ? 'Authenticating...' : 'Sign In'}
                            </Button>
                        </form>
                    </TabsContent>
                </Tabs>
            </CardContent>
            <CardFooter className="justify-center border-t py-4">
                <p className="text-xs text-muted-foreground">Authorized Personnel Only. All actions are audited.</p>
            </CardFooter>
        </Card>
    )
}
