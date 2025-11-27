import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { generateSlug } from "@/lib/utils"
import { z } from "zod"

const registerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  clinicName: z.string().min(1, "Clinic name is required"),
  timezone: z.string().optional(),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const validatedData = registerSchema.parse(body)

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 }
      )
    }

    // Generate unique slug for clinic
    let baseSlug = generateSlug(validatedData.clinicName)
    let slug = baseSlug
    let counter = 1
    while (await prisma.clinic.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`
      counter++
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(validatedData.password, 10)

    // Create user, clinic, and membership in a transaction
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name: validatedData.name,
          email: validatedData.email,
          password: hashedPassword,
        },
      })

      const clinic = await tx.clinic.create({
        data: {
          name: validatedData.clinicName,
          slug,
          timezone: validatedData.timezone || "UTC",
          ownerId: user.id,
        },
      })

      await tx.clinicMembership.create({
        data: {
          userId: user.id,
          clinicId: clinic.id,
          role: "ADMIN",
        },
      })

      // Create trial subscription
      const trialEndsAt = new Date()
      trialEndsAt.setDate(trialEndsAt.getDate() + 14)

      await tx.subscription.create({
        data: {
          clinicId: clinic.id,
          status: "TRIALING",
          trialEndsAt,
          currentPlan: "BASIC",
        },
      })

      return { user, clinic }
    })

    return NextResponse.json(
      {
        message: "Registration successful",
        clinicId: result.clinic.id,
      },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      )
    }

    console.error("Registration error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

