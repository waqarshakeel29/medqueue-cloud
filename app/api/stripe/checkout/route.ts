import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { hasClinicAccess, ClinicRole } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2024-12-18.acacia",
})

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { clinicId, priceId } = body

    if (!clinicId || !priceId) {
      return NextResponse.json(
        { error: "clinicId and priceId are required" },
        { status: 400 }
      )
    }

    const hasAccess = await hasClinicAccess(session.user.id, clinicId, ClinicRole.ADMIN)
    if (!hasAccess) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const clinic = await prisma.clinic.findUnique({
      where: { id: clinicId },
      include: { subscription: true },
    })

    if (!clinic) {
      return NextResponse.json({ error: "Clinic not found" }, { status: 404 })
    }

    let customerId = clinic.subscription?.stripeCustomerId

    // Create Stripe customer if doesn't exist
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: session.user.email || undefined,
        name: clinic.name,
        metadata: {
          clinicId: clinic.id,
        },
      })
      customerId = customer.id

      // Update subscription with customer ID
      await prisma.subscription.update({
        where: { clinicId },
        data: { stripeCustomerId: customerId },
      })
    }

    // Create checkout session
    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXTAUTH_URL}/app/clinic/${clinicId}/settings/billing?success=true`,
      cancel_url: `${process.env.NEXTAUTH_URL}/app/clinic/${clinicId}/settings/billing?canceled=true`,
      metadata: {
        clinicId: clinic.id,
      },
    })

    return NextResponse.json({ url: checkoutSession.url })
  } catch (error) {
    console.error("Stripe checkout error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

