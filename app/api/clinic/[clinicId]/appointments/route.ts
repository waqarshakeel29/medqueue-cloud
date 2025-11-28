import { NextResponse } from "next/server"
import { auth, hasClinicAccess } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const appointmentSchema = z.object({
  doctorId: z.string(),
  patientId: z.string(),
  date: z.string(),
  startTime: z.string(),
  primaryServiceId: z.string().optional(),
  visitType: z.enum(["NEW", "FOLLOW_UP"]).default("NEW"),
  notesForReception: z.string().optional(),
  notesForDoctor: z.string().optional(),
})

export async function GET(
  request: Request,
  { params }: { params: Promise<{ clinicId: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { clinicId } = await params
    const { searchParams } = new URL(request.url)
    const date = searchParams.get("date") || new Date().toISOString().split("T")[0]
    const doctorId = searchParams.get("doctorId")

    const hasAccess = await hasClinicAccess(session.user.id, clinicId)
    if (!hasAccess) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const appointments = await prisma.appointment.findMany({
      where: {
        clinicId,
        date: new Date(date),
        ...(doctorId && { doctorId }),
      },
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
        primaryService: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: [
        { startTime: "asc" },
        { tokenNumber: "asc" },
      ],
    })

    return NextResponse.json(appointments)
  } catch (error) {
    console.error("Error fetching appointments:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ clinicId: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { clinicId } = await params
    const hasAccess = await hasClinicAccess(session.user.id, clinicId)
    if (!hasAccess) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = appointmentSchema.parse(body)

    // Get max token number for this doctor and date
    const maxToken = await prisma.appointment.findFirst({
      where: {
        clinicId,
        doctorId: validatedData.doctorId,
        date: new Date(validatedData.date),
      },
      orderBy: {
        tokenNumber: "desc",
      },
      select: {
        tokenNumber: true,
      },
    })

    const tokenNumber = (maxToken?.tokenNumber || 0) + 1

    // Combine date and time
    const appointmentDate = new Date(validatedData.date)
    const [hours, minutes] = validatedData.startTime.split(":").map(Number)
    const startTime = new Date(appointmentDate)
    startTime.setHours(hours, minutes, 0, 0)

    const primaryServiceId =
      validatedData.primaryServiceId && validatedData.primaryServiceId.trim() !== ""
        ? validatedData.primaryServiceId
        : undefined

    const appointment = await prisma.appointment.create({
      data: {
        clinicId,
        doctorId: validatedData.doctorId,
        patientId: validatedData.patientId,
        date: appointmentDate,
        startTime,
        tokenNumber,
        primaryServiceId,
        visitType: validatedData.visitType,
        notesForReception: validatedData.notesForReception,
        notesForDoctor: validatedData.notesForDoctor,
        status: "SCHEDULED",
      },
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

    return NextResponse.json(appointment, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      )
    }
    console.error("Error creating appointment:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

