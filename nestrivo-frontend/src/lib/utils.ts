import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Định dạng tiền tệ VND (ví dụ: 3.500.000 ₫)
 */
export function formatVND(amount: number | string): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(num)) return "0 ₫";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(num);
}

/**
 * Định dạng diện tích m² (ví dụ: 28 m²)
 */
export function formatArea(area: number | string): string {
  const num = typeof area === "string" ? parseFloat(area) : area;
  if (isNaN(num)) return "0 m²";
  return `${num} m²`;
}

