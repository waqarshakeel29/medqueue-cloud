import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { hasClinicAccess } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const doctorSchema = z.object({
  name: z.string().min(1),
  speciality: z.string().optional(),
  roomNumber: z.string().optional(),
  isActive: z.boolean().default(true),
})

export async function GET(
  request: Request,
  { params }: { params: Promise<{ clinicId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { clinicId } = await params
    const hasAccess = await hasClinicAccess(session.user.id, clinicId)
    if (!hasAccess) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const doctors = await prisma.doctor.findMany({
      where: { clinicId },
      orderBy: { name: "asc" },
    })

    return NextResponse.json(doctors)
  } catch (error) {
    console.error("Error fetching doctors:", error)
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
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { clinicId } = await params
    const hasAccess = await hasClinicAccess(session.user.id, clinicId)
    if (!hasAccess) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = doctorSchema.parse(body)

    const doctor = await prisma.doctor.create({
      data: {
        clinicId,
        name: validatedData.name,
        speciality: validatedData.speciality || undefined,
        roomNumber: validatedData.roomNumber || undefined,
        isActive: validatedData.isActive,
      },
    })

    return NextResponse.json(doctor, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      )
    }
    console.error("Error creating doctor:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

