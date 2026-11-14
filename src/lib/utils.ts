import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
export function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }
export const money = (price: number) => price === 0 ? 'Free' : new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: price % 1 ? 2 : 0 }).format(price);
