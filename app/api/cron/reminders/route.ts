import { NextResponse } from "next/server"
import { headers } from "next/headers"
import { prisma } from "@/lib/prisma"
import { addDays, startOfDay, endOfDay } from "date-fns"

export async function GET(request: Request) {
  try {
    const headersList = await headers()
    const cronSecret = headersList.get("x-cron-secret")

    if (cronSecret !== process.env.CRON_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const tomorrow = addDays(new Date(), 1)
    const start = startOfDay(tomorrow)
    const end = endOfDay(tomorrow)

    // Get appointments scheduled for tomorrow
    const appointments = await prisma.appointment.findMany({
      where: {
        date: {
          gte: start,
          lte: end,
        },
        status: "SCHEDULED",
      },
      include: {
        clinic: true,
        doctor: true,
        patient: true,
      },
    })

    const reminders = []

    for (const appointment of appointments) {
      // Skip if clinic trial ended and no active subscription
      const subscription = await prisma.subscription.findUnique({
        where: { clinicId: appointment.clinicId },
      })

      if (subscription?.trialEndsAt) {
        const trialEnd = new Date(subscription.trialEndsAt)
        if (trialEnd < new Date() && subscription.status !== "ACTIVE") {
          continue
        }
      }

      reminders.push({
        appointmentId: appointment.id,
        clinicName: appointment.clinic.name,
        doctorName: appointment.doctor.name,
        patientName: appointment.patient.name,
        patientPhone: appointment.patient.phone,
        patientEmail: appointment.patient.email,
        date: appointment.date,
        startTime: appointment.startTime,
      })

      // In a real implementation, you would send SMS or email here
      console.log(`Reminder for ${appointment.patient.name}:`, {
        doctor: appointment.doctor.name,
        date: appointment.date,
        time: appointment.startTime,
        phone: appointment.patient.phone,
      })
    }

    return NextResponse.json({
      success: true,
      remindersSent: reminders.length,
      reminders,
    })
  } catch (error) {
    console.error("Reminders cron error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

