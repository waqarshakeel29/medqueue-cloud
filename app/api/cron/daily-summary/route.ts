import { NextResponse } from "next/server"
import { headers } from "next/headers"
import { prisma } from "@/lib/prisma"
import { startOfDay, endOfDay, subDays } from "date-fns"

export async function GET(request: Request) {
  try {
    const headersList = await headers()
    const cronSecret = headersList.get("x-cron-secret")

    if (cronSecret !== process.env.CRON_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const yesterday = subDays(new Date(), 1)
    const start = startOfDay(yesterday)
    const end = endOfDay(yesterday)

    // Get all clinics
    const clinics = await prisma.clinic.findMany({
      include: {
        subscription: true,
      },
    })

    const summaries = []

    for (const clinic of clinics) {
      // Skip if trial ended and no active subscription
      if (clinic.subscription?.trialEndsAt) {
        const trialEnd = new Date(clinic.subscription.trialEndsAt)
        if (trialEnd < new Date() && clinic.subscription.status !== "ACTIVE") {
          continue
        }
      }

      const [appointments, invoices] = await Promise.all([
        prisma.appointment.count({
          where: {
            clinicId: clinic.id,
            date: {
              gte: start,
              lte: end,
            },
          },
        }),
        prisma.invoice.aggregate({
          where: {
            clinicId: clinic.id,
            createdAt: {
              gte: start,
              lte: end,
            },
            status: "PAID",
          },
          _sum: {
            totalAmount: true,
          },
        }),
      ])

      summaries.push({
        clinicId: clinic.id,
        clinicName: clinic.name,
        date: yesterday.toISOString().split("T")[0],
        appointments,
        revenue: Number(invoices._sum.totalAmount || 0),
      })

      // In a real implementation, you would send an email here
      console.log(`Daily summary for ${clinic.name}:`, {
        appointments,
        revenue: invoices._sum.totalAmount,
      })
    }

    return NextResponse.json({
      success: true,
      date: yesterday.toISOString().split("T")[0],
      summaries,
    })
  } catch (error) {
    console.error("Daily summary cron error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

