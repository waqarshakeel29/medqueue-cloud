import { NextResponse } from "next/server"
import { auth, hasClinicAccess, ClinicRole } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import bcrypt from "bcryptjs"

const createMemberSchema = z.object({
  email: z.string().email().optional().or(z.literal("")),
  name: z.string().min(1),
  cnic: z.string().min(1, "CNIC is required"),
  password: z.string().min(8),
  role: z.nativeEnum(ClinicRole),
  speciality: z.string().optional(),
  roomNumber: z.string().optional(),
})

export async function GET(
  request: Request,
  { params }: { params: Promise<{ clinicId: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { clinicId } = await params

  const isAdmin = await hasClinicAccess(session.user.id, clinicId, ClinicRole.ADMIN)
  if (!isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const members = await prisma.clinicMembership.findMany({
    where: { clinicId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          cnic: true,
        },
      },
    },
    orderBy: {
      createdAt: "asc",
    },
  })

  return NextResponse.json(
    members.map((member) => ({
      id: member.id,
      role: member.role,
      createdAt: member.createdAt,
      user: member.user,
    }))
  )
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ clinicId: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { clinicId } = await params

  const isAdmin = await hasClinicAccess(session.user.id, clinicId, ClinicRole.ADMIN)
  if (!isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  try {
    const body = await request.json()
    const validated = createMemberSchema.parse(body)
    const email = validated.email && validated.email.trim() !== "" 
      ? validated.email.toLowerCase().trim() 
      : null
    // Normalize CNIC by removing dashes and spaces
    const cnic = validated.cnic.trim().replace(/[-\s]/g, "")

    const result = await prisma.$transaction(async (tx) => {
      // Check if user exists by CNIC or email
      const existingByCnic = await tx.user.findUnique({ where: { cnic } })
      if (existingByCnic) {
        throw new Error("User with this CNIC already exists.")
      }

      if (email) {
        const existingByEmail = await tx.user.findUnique({ where: { email } })
        if (existingByEmail) {
          throw new Error("User with this email already exists.")
        }
      }

      const hashedPassword = await bcrypt.hash(validated.password, 10)
      const user = await tx.user.create({
        data: {
          email,
          cnic,
          name: validated.name,
          password: hashedPassword,
        },
      })

      const membership = await tx.clinicMembership.upsert({
        where: {
          userId_clinicId: {
            userId: user.id,
            clinicId,
          },
        },
        update: {
          role: validated.role,
        },
        create: {
          clinicId,
          userId: user.id,
          role: validated.role,
        },
      })

      let doctorRecord = null
      if (validated.role === ClinicRole.DOCTOR) {
        doctorRecord = await tx.doctor.findFirst({
          where: {
            clinicId,
            userId: user.id,
          },
        })

        if (doctorRecord) {
          doctorRecord = await tx.doctor.update({
            where: { id: doctorRecord.id },
            data: {
              name: validated.name,
              speciality: validated.speciality,
              roomNumber: validated.roomNumber,
              isActive: true,
            },
          })
        } else {
          doctorRecord = await tx.doctor.create({
            data: {
              clinicId,
              userId: user.id,
              name: validated.name,
              speciality: validated.speciality,
              roomNumber: validated.roomNumber,
            },
          })
        }
      }

      return {
        membership,
        user,
      }
    })

    return NextResponse.json(
      {
        member: {
          id: result.membership.id,
          role: result.membership.role,
          createdAt: result.membership.createdAt,
          user: {
            id: result.user.id,
            name: result.user.name,
            email: result.user.email,
            cnic: result.user.cnic,
          },
        },
      },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof Error && error.message.includes("already exists")) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      )
    }

    console.error("Error creating team member:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

