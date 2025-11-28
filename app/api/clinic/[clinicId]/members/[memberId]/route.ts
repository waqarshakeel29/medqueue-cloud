import { NextResponse } from "next/server"
import { auth, hasClinicAccess, ClinicRole } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import bcrypt from "bcryptjs"

const updateMemberSchema = z.object({
  email: z.string().email().optional().or(z.literal("")),
  name: z.string().min(1).optional(),
  cnic: z.string().min(1, "CNIC is required").optional(),
  password: z.string().min(8).optional(),
  role: z.nativeEnum(ClinicRole).optional(),
  speciality: z.string().optional(),
  roomNumber: z.string().optional(),
})

export async function GET(
  request: Request,
  { params }: { params: Promise<{ clinicId: string; memberId: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { clinicId, memberId } = await params

  const isAdmin = await hasClinicAccess(session.user.id, clinicId, ClinicRole.ADMIN)
  if (!isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const membership = await prisma.clinicMembership.findUnique({
    where: { id: memberId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          cnic: true,
          createdAt: true,
        },
      },
      clinic: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  })

  if (!membership || membership.clinicId !== clinicId) {
    return NextResponse.json({ error: "Member not found" }, { status: 404 })
  }

  // Get doctor details if role is DOCTOR
  let doctorDetails = null
  if (membership.role === ClinicRole.DOCTOR) {
    doctorDetails = await prisma.doctor.findFirst({
      where: {
        clinicId,
        userId: membership.userId,
      },
      select: {
        id: true,
        speciality: true,
        roomNumber: true,
        isActive: true,
      },
    })
  }

  return NextResponse.json({
    id: membership.id,
    role: membership.role,
    createdAt: membership.createdAt,
    user: membership.user,
    doctor: doctorDetails,
  })
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ clinicId: string; memberId: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { clinicId, memberId } = await params

  const isAdmin = await hasClinicAccess(session.user.id, clinicId, ClinicRole.ADMIN)
  if (!isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  try {
    const body = await request.json()
    const validated = updateMemberSchema.parse(body)

    const membership = await prisma.clinicMembership.findUnique({
      where: { id: memberId },
      include: { user: true },
    })

    if (!membership || membership.clinicId !== clinicId) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 })
    }

    const result = await prisma.$transaction(async (tx) => {
      const updateData: any = {}

      if (validated.name !== undefined) {
        updateData.name = validated.name
      }

      if (validated.email !== undefined) {
        const email = validated.email && validated.email.trim() !== ""
          ? validated.email.toLowerCase().trim()
          : null

        if (email) {
          // Check if email is already taken by another user
          const existingByEmail = await tx.user.findUnique({
            where: { email },
          })
          if (existingByEmail && existingByEmail.id !== membership.userId) {
            throw new Error("Email is already taken by another user.")
          }
        }
        updateData.email = email
      }

      if (validated.cnic !== undefined) {
        const cnic = validated.cnic.trim().replace(/[-\s]/g, "")
        // Check if CNIC is already taken by another user
        const existingByCnic = await tx.user.findUnique({
          where: { cnic },
        })
        if (existingByCnic && existingByCnic.id !== membership.userId) {
          throw new Error("CNIC is already taken by another user.")
        }
        updateData.cnic = cnic
      }

      if (validated.password !== undefined) {
        updateData.password = await bcrypt.hash(validated.password, 10)
      }

      const user = await tx.user.update({
        where: { id: membership.userId },
        data: updateData,
      })

      // Update membership role if provided
      if (validated.role !== undefined) {
        await tx.clinicMembership.update({
          where: { id: memberId },
          data: { role: validated.role },
        })
      }

      // Update or create doctor record if role is DOCTOR
      if (validated.role === ClinicRole.DOCTOR || membership.role === ClinicRole.DOCTOR) {
        const doctorRecord = await tx.doctor.findFirst({
          where: {
            clinicId,
            userId: membership.userId,
          },
        })

        const doctorData: any = {
          name: validated.name !== undefined ? validated.name : user.name,
          speciality: validated.speciality,
          roomNumber: validated.roomNumber,
          isActive: true,
        }

        if (doctorRecord) {
          await tx.doctor.update({
            where: { id: doctorRecord.id },
            data: doctorData,
          })
        } else if (validated.role === ClinicRole.DOCTOR || membership.role === ClinicRole.DOCTOR) {
          await tx.doctor.create({
            data: {
              clinicId,
              userId: membership.userId,
              ...doctorData,
            },
          })
        }
      }

      // Get updated membership
      const updatedMembership = await tx.clinicMembership.findUnique({
        where: { id: memberId },
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
      })

      return updatedMembership!
    })

    return NextResponse.json({
      member: {
        id: result.id,
        role: result.role,
        createdAt: result.createdAt,
        user: result.user,
      },
    })
  } catch (error) {
    if (error instanceof Error && error.message.includes("already taken")) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      )
    }

    console.error("Error updating team member:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ clinicId: string; memberId: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { clinicId, memberId } = await params

  const isAdmin = await hasClinicAccess(session.user.id, clinicId, ClinicRole.ADMIN)
  if (!isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  try {
    const membership = await prisma.clinicMembership.findUnique({
      where: { id: memberId },
      include: { user: true },
    })

    if (!membership || membership.clinicId !== clinicId) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 })
    }

    // Prevent deleting yourself
    if (membership.userId === session.user.id) {
      return NextResponse.json(
        { error: "You cannot delete your own account" },
        { status: 400 }
      )
    }

    // Prevent deleting the clinic owner
    const clinic = await prisma.clinic.findUnique({
      where: { id: clinicId },
    })

    if (clinic?.ownerId === membership.userId) {
      return NextResponse.json(
        { error: "Cannot delete the clinic owner" },
        { status: 400 }
      )
    }

    await prisma.$transaction(async (tx) => {
      // Delete doctor record if exists
      await tx.doctor.deleteMany({
        where: {
          clinicId,
          userId: membership.userId,
        },
      })

      // Delete membership
      await tx.clinicMembership.delete({
        where: { id: memberId },
      })

      // Note: We don't delete the user account itself as they might have memberships in other clinics
    })

    return NextResponse.json({ message: "Member removed successfully" })
  } catch (error) {
    console.error("Error deleting team member:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

