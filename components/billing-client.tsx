"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, XCircle, CreditCard } from "lucide-react"

interface BillingClientProps {
  clinicId: string
  subscription: {
    id: string
    currentPlan: string
    status: string
    trialEndsAt?: Date | string | null
    currentPeriodEnd?: Date | string | null
  } | null
  success: boolean
  canceled: boolean
  priceIds: {
    basic: string
    pro: string
  }
}

export function BillingClient({
  clinicId,
  subscription,
  success,
  canceled,
  priceIds,
}: BillingClientProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleUpgrade = async (priceId: string) => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clinicId, priceId }),
      })

      const data = await response.json()
      if (data.url) {
        window.location.href = data.url
      }
    } catch (error) {
      console.error("Error creating checkout:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const isTrial = subscription?.status === "TRIALING"
  const trialEndsAt = subscription?.trialEndsAt
    ? new Date(subscription.trialEndsAt)
    : null
  const daysLeft = trialEndsAt
    ? Math.ceil((trialEndsAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Billing & Subscription</h1>
        <p className="text-gray-600 mt-1">Manage your subscription</p>
      </div>

      {success && (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            Your subscription has been updated successfully!
          </AlertDescription>
        </Alert>
      )}

      {canceled && (
        <Alert className="bg-yellow-50 border-yellow-200">
          <XCircle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            Subscription update was canceled.
          </AlertDescription>
        </Alert>
      )}

      {isTrial && (
        <Alert className="bg-blue-50 border-blue-200">
          <AlertDescription className="text-blue-800">
            You're on a free trial. {daysLeft > 0 ? `${daysLeft} days remaining.` : "Trial has ended."}{" "}
            Add a payment method to continue using MedQueue Cloud.
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Current Plan</CardTitle>
          <CardDescription>Your current subscription details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {subscription ? (
            <>
              <div>
                <div className="text-sm text-gray-600">Plan</div>
                <div className="text-2xl font-bold">{subscription.currentPlan}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Status</div>
                <div className="text-lg font-medium">{subscription.status}</div>
              </div>
              {trialEndsAt && (
                <div>
                  <div className="text-sm text-gray-600">Trial Ends</div>
                  <div className="text-lg font-medium">
                    {trialEndsAt.toLocaleDateString()}
                  </div>
                </div>
              )}
              {subscription.currentPeriodEnd && (
                <div>
                  <div className="text-sm text-gray-600">Next Billing Date</div>
                  <div className="text-lg font-medium">
                    {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                  </div>
                </div>
              )}
            </>
          ) : (
            <p className="text-gray-600">No subscription found.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Upgrade Plan</CardTitle>
          <CardDescription>Choose a plan that works for you</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-2">Basic - $29/month</h3>
              <ul className="text-sm text-gray-600 space-y-1 mb-4">
                <li>• Up to 3 doctors</li>
                <li>• Unlimited appointments</li>
                <li>• Queue management</li>
                <li>• Basic billing</li>
              </ul>
              <Button
                className="w-full"
                variant="outline"
                disabled={isLoading || !priceIds.basic}
                onClick={() => {
                  if (priceIds.basic) handleUpgrade(priceIds.basic)
                }}
              >
                <CreditCard className="mr-2 h-4 w-4" />
                Select Basic
              </Button>
            </div>
            <div className="border rounded-lg p-4 border-primary">
              <h3 className="font-semibold mb-2">Pro - $79/month</h3>
              <ul className="text-sm text-gray-600 space-y-1 mb-4">
                <li>• Up to 10 doctors</li>
                <li>• Everything in Basic</li>
                <li>• Advanced reporting</li>
                <li>• Priority support</li>
              </ul>
              <Button
                className="w-full"
                disabled={isLoading || !priceIds.pro}
                onClick={() => {
                  if (priceIds.pro) handleUpgrade(priceIds.pro)
                }}
              >
                <CreditCard className="mr-2 h-4 w-4" />
                Select Pro
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

