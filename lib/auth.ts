import { NextAuthOptions } from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { ClinicRole } from "@prisma/client"

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/auth/login",
    signOut: "/auth/login",
    error: "/auth/login",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        })

        if (!user || !user.password) {
          return null
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        )

        if (!isPasswordValid) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
      }
      return session
    },
  },
}

export async function getUserClinicMemberships(userId: string) {
  return prisma.clinicMembership.findMany({
    where: { userId },
    include: {
      clinic: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    },
  })
}

export async function hasClinicAccess(
  userId: string,
  clinicId: string,
  requiredRole?: ClinicRole
): Promise<boolean> {
  const membership = await prisma.clinicMembership.findUnique({
    where: {
      userId_clinicId: {
        userId,
        clinicId,
      },
    },
  })

  if (!membership) {
    return false
  }

  if (!requiredRole) {
    return true
  }

  const roleHierarchy: Record<ClinicRole, number> = {
    RECEPTION: 1,
    DOCTOR: 2,
    ADMIN: 3,
  }

  return roleHierarchy[membership.role] >= roleHierarchy[requiredRole]
}

// Helper function for getting server session (NextAuth v5 compatible)
// For now, returns null until database is set up
export async function getSession() {
  // TODO: Implement proper session retrieval once database is configured
  // This is a temporary implementation to allow the app to build
  return null
}

