"use client"

import { useTransition } from "react"
import { useRouter } from "next/navigation"

export function RetryButton() {
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => startTransition(() => router.refresh())}
      className="mt-4 rounded-full border border-status-rejected-fg/30 px-4 py-2 text-sm font-semibold transition-colors hover:bg-status-rejected-fg/10 disabled:cursor-wait disabled:opacity-60"
    >
      {pending ? "Retrying..." : "Try again"}
    </button>
  )
}
