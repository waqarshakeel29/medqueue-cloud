import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function generateInvoiceNumber(clinicId: string, sequence: number): string {
  const prefix = clinicId.slice(0, 4).toUpperCase()
  return `INV-${prefix}-${String(sequence).padStart(6, '0')}`
}

