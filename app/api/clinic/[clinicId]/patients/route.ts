import { NextResponse } from "next/server"
import { getSession, hasClinicAccess } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const patientSchema = z.object({
  name: z.string().min(1),
  phone: z.string().min(1),
  email: z.string().email().optional().or(z.literal("")),
  gender: z.string().optional(),
  dateOfBirth: z.string().optional(),
  address: z.string().optional(),
  notes: z.string().optional(),
})

export async function GET(
  request: Request,
  { params }: { params: Promise<{ clinicId: string }> }
) {
  try {
    const session = await getSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { clinicId } = await params
    const hasAccess = await hasClinicAccess(session.user.id, clinicId)
    if (!hasAccess) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const patients = await prisma.patient.findMany({
      where: { clinicId },
      orderBy: { name: "asc" },
      take: 1000,
    })

    return NextResponse.json(patients)
  } catch (error) {
    console.error("Error fetching patients:", error)
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
    const session = await getSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { clinicId } = await params
    const hasAccess = await hasClinicAccess(session.user.id, clinicId)
    if (!hasAccess) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = patientSchema.parse(body)

    const patient = await prisma.patient.create({
      data: {
        clinicId,
        name: validatedData.name,
        phone: validatedData.phone,
        email: validatedData.email || undefined,
        gender: validatedData.gender || undefined,
        dateOfBirth: validatedData.dateOfBirth
          ? new Date(validatedData.dateOfBirth)
          : undefined,
        address: validatedData.address || undefined,
        notes: validatedData.notes || undefined,
      },
    })

    return NextResponse.json(patient, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      )
    }
    console.error("Error creating patient:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

