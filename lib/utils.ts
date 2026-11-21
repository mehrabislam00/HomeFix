export { cn } from "cn"

export function formatBDT(amount: number) {
  return `৳${new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(amount)}`
}