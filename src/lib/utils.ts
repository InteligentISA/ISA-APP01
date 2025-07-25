import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function isPremiumUser(user: any): boolean {
  return ["weekly", "monthly", "annual"].includes(user?.plan);
}
