import "next-auth"
import { ClinicRole } from "@prisma/client"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email: string
      name?: string | null
    }
  }

  interface User {
    id: string
    email: string
    name?: string | null
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
  }
}

export interface ClinicMember {
  id: string
  role: ClinicRole
  clinic: {
    id: string
    name: string
    slug: string
  }
}

