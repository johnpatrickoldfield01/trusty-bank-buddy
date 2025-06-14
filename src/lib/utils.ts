
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatAccountNumber(accountNumber: string | null | undefined): string {
  if (!accountNumber) return '';
  // Remove all non-digit characters and then add a space every 4 digits.
  return accountNumber.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim();
}
