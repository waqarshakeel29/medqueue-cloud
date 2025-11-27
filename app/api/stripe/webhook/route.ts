import { NextResponse } from "next/server"
import { headers } from "next/headers"
import Stripe from "stripe"
import { prisma } from "@/lib/prisma"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2024-12-18.acacia",
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || ""

export async function POST(request: Request) {
  const body = await request.text()
  const headersList = await headers()
  const signature = headersList.get("stripe-signature")

  if (!signature) {
    return NextResponse.json(
      { error: "No signature" },
      { status: 400 }
    )
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err) {
    console.error("Webhook signature verification failed:", err)
    return NextResponse.json(
      { error: "Invalid signature" },
      { status: 400 }
    )
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session
        const clinicId = session.metadata?.clinicId

        if (clinicId && session.subscription) {
          const subscription = await stripe.subscriptions.retrieve(
            session.subscription as string
          )

          const planMap: Record<string, "BASIC" | "PRO" | "ENTERPRISE"> = {
            [process.env.STRIPE_PRICE_ID_BASIC || ""]: "BASIC",
            [process.env.STRIPE_PRICE_ID_PRO || ""]: "PRO",
          }

          const priceId = subscription.items.data[0]?.price.id
          const plan = planMap[priceId || ""] || "BASIC"

          await prisma.subscription.update({
            where: { clinicId },
            data: {
              stripeSubscriptionId: subscription.id,
              stripePriceId: priceId,
              currentPlan: plan,
              status: "ACTIVE",
              currentPeriodEnd: new Date(subscription.current_period_end * 1000),
              trialEndsAt: null,
            },
          })
        }
        break
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription
        const clinic = await prisma.clinic.findFirst({
          where: {
            subscription: {
              stripeSubscriptionId: subscription.id,
            },
          },
        })

        if (clinic) {
          const planMap: Record<string, "BASIC" | "PRO" | "ENTERPRISE"> = {
            [process.env.STRIPE_PRICE_ID_BASIC || ""]: "BASIC",
            [process.env.STRIPE_PRICE_ID_PRO || ""]: "PRO",
          }

          const priceId = subscription.items.data[0]?.price.id
          const plan = planMap[priceId || ""] || "BASIC"

          await prisma.subscription.update({
            where: { clinicId: clinic.id },
            data: {
              stripePriceId: priceId,
              currentPlan: plan,
              status:
                subscription.status === "active"
                  ? "ACTIVE"
                  : subscription.status === "past_due"
                  ? "PAST_DUE"
                  : "CANCELLED",
              currentPeriodEnd: new Date(subscription.current_period_end * 1000),
            },
          })
        }
        break
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription
        const clinic = await prisma.clinic.findFirst({
          where: {
            subscription: {
              stripeSubscriptionId: subscription.id,
            },
          },
        })

        if (clinic) {
          await prisma.subscription.update({
            where: { clinicId: clinic.id },
            data: {
              status: "CANCELLED",
              stripeSubscriptionId: null,
            },
          })
        }
        break
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Webhook handler error:", error)
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    )
  }
}

