export { cn } from "cn"

/** Bangladeshi Taka display: symbol first, thousands separators. e.g. 1200 → "৳1,200" */
export function formatBDT(amount: number) {
  return `৳${new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(amount)}`
}