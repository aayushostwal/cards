import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number | null): string {
  if (amount === null) return 'N/A';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatNumber(num: number | null): string {
  if (num === null) return 'N/A';
  return new Intl.NumberFormat('en-IN').format(num);
}

export function formatPercent(value: number | null): string {
  if (value === null) return 'N/A';
  return `${value}%`;
}
