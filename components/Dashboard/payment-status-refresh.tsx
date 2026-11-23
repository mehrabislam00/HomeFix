"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { RefreshCw } from "lucide-react"

import { Button } from "@/components/ui/button"
import { btn } from "@/lib/button-styles"
import { cn } from "@/lib/utils"

export function PaymentStatusRefresh() {
  const router = useRouter()

  useEffect(() => {
    let delay = 3000
    let timer: number
    const refresh = () => {
      router.refresh()
      delay = Math.min(delay * 2, 60000)
      timer = window.setTimeout(refresh, delay)
    }
    timer = window.setTimeout(refresh, delay)
    return () => window.clearTimeout(timer)
  }, [router])

  return (
    <Button
      type="button"
      onClick={() => router.refresh()}
      className={cn(btn.md, btn.secondary)}
    >
      <RefreshCw aria-hidden className="size-4" />
      Check payment status
    </Button>
  )
}
