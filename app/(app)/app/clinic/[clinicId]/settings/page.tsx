import { redirect } from "next/navigation"
import { auth, hasClinicAccess, ClinicRole } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { CreditCard } from "lucide-react"

export default async function SettingsPage({
  params,
}: {
  params: Promise<{ clinicId: string }>
}) {
  const session = await auth()
  const { clinicId } = await params

  if (!session?.user?.id) {
    redirect("/auth/login")
  }

  const hasAccess = await hasClinicAccess(session.user.id, clinicId, ClinicRole.ADMIN)
  if (!hasAccess) {
    redirect("/app")
  }

  const subscription = await prisma.subscription.findUnique({
    where: { clinicId },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-gray-600 mt-1">Manage your clinic settings</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Billing & Subscription</CardTitle>
          <CardDescription>
            Manage your subscription and billing information
          </CardDescription>
        </CardHeader>
        <CardContent>
          {subscription && (
            <div className="space-y-4">
              <div>
                <div className="text-sm text-gray-600">Current Plan</div>
                <div className="text-lg font-medium">{subscription.currentPlan}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Status</div>
                <div className="text-lg font-medium">{subscription.status}</div>
              </div>
              {subscription.trialEndsAt && (
                <div>
                  <div className="text-sm text-gray-600">Trial Ends</div>
                  <div className="text-lg font-medium">
                    {new Date(subscription.trialEndsAt).toLocaleDateString()}
                  </div>
                </div>
              )}
              <Button asChild>
                <Link href={`/app/clinic/${clinicId}/settings/billing`}>
                  <CreditCard className="mr-2 h-4 w-4" />
                  Manage Billing
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Team &amp; Permissions</CardTitle>
          <CardDescription>
            Invite employees and control their access level.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Add doctors, reception staff, and other administrators to your clinic.
          </p>
          <Button asChild>
            <Link href={`/app/clinic/${clinicId}/settings/team`}>Manage team</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

