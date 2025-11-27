import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { hasClinicAccess, ClinicRole } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { BillingClient } from "@/components/billing-client"

export default async function BillingPage({
  params,
  searchParams,
}: {
  params: Promise<{ clinicId: string }>
  searchParams: Promise<{ success?: string; canceled?: string }>
}) {
  const session = await getServerSession(authOptions)
  const { clinicId } = await params
  const { success, canceled } = await searchParams

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

  const priceIds = {
    basic: process.env.STRIPE_PRICE_ID_BASIC || "",
    pro: process.env.STRIPE_PRICE_ID_PRO || "",
  }

  return (
    <BillingClient
      clinicId={clinicId}
      subscription={subscription}
      success={success === "true"}
      canceled={canceled === "true"}
      priceIds={priceIds}
    />
  )
}

