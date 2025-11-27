import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { hasClinicAccess } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const updateSchema = z.object({
  status: z.enum([
    "SCHEDULED",
    "CHECKED_IN",
    "IN_CONSULTATION",
    "COMPLETED",
    "NO_SHOW",
    "CANCELLED",
  ]).optional(),
  date: z.string().optional(),
  startTime: z.string().optional(),
  notesForReception: z.string().optional(),
  notesForDoctor: z.string().optional(),
})

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ clinicId: string; appointmentId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { clinicId, appointmentId } = await params
    const hasAccess = await hasClinicAccess(session.user.id, clinicId)
    if (!hasAccess) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = updateSchema.parse(body)

    const updateData: any = { ...validatedData }

    // Handle date and time updates
    if (validatedData.date || validatedData.startTime) {
      const appointment = await prisma.appointment.findUnique({
        where: { id: appointmentId },
      })

      if (!appointment) {
        return NextResponse.json({ error: "Appointment not found" }, { status: 404 })
      }

      const appointmentDate = validatedData.date
        ? new Date(validatedData.date)
        : appointment.date

      if (validatedData.startTime) {
        const [hours, minutes] = validatedData.startTime.split(":").map(Number)
        const startTime = new Date(appointmentDate)
        startTime.setHours(hours, minutes, 0, 0)
        updateData.startTime = startTime
      }

      if (validatedData.date) {
        updateData.date = appointmentDate
      }

      delete updateData.date
    }

    delete updateData.startTime

    const appointment = await prisma.appointment.update({
      where: { id: appointmentId },
      data: updateData,
      include: {
        doctor: {
          select: {
            id: true,
            name: true,
            speciality: true,
          },
        },
        patient: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
      },
    })

    return NextResponse.json(appointment)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      )
    }
    console.error("Error updating appointment:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ clinicId: string; appointmentId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { clinicId, appointmentId } = await params
    const hasAccess = await hasClinicAccess(session.user.id, clinicId)
    if (!hasAccess) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    await prisma.appointment.delete({
      where: { id: appointmentId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting appointment:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

