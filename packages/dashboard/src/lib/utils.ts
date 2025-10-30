import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combines class names using clsx and tailwind-merge
 * Useful for conditional styling in React components
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

