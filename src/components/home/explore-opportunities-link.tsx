"use client"
import { useRef, useState } from "react"
import Link from "next/link"
import { LoaderCircle, ArrowUpRight } from "lucide-react"
import { useRouter } from "next/navigation"
import { createCareerClient } from "@/lib/client/career-client"
export function ExploreOpportunitiesLink() {
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const lock = useRef(false)
  const router = useRouter()
  return (
    <div className="min-w-0">
      <Link
        href="/recommendations"
        aria-disabled={pending}
        onClick={(event) => {
          if (
            event.metaKey ||
            event.ctrlKey ||
            event.shiftKey ||
            event.altKey ||
            event.button !== 0
          )
            return
          event.preventDefault()
          if (lock.current) return
          lock.current = true
          setPending(true)
          setError(null)
          void (async () => {
            try {
              const client = createCareerClient()
              const profile = await client.getProfile()
              router.push(profile ? "/recommendations" : "/profile")
            } catch (failure) {
              setError(
                failure instanceof Error
                  ? failure.message
                  : "Could not open your workspace. Please retry."
              )
            } finally {
              lock.current = false
              setPending(false)
            }
          })()
        }}
        className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-lg border bg-card px-5 text-sm font-medium transition-colors hover:bg-muted sm:w-auto"
      >
        {pending ? (
          <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
        ) : null}
        {pending ? "Checking your profile…" : "Explore Opportunities"}
        {!pending && <ArrowUpRight className="size-4" aria-hidden="true" />}
      </Link>
      {error && (
        <p
          role="alert"
          className="mt-3 max-w-xs text-xs leading-5 text-destructive"
        >
          {error} Try Explore Opportunities again, or create a profile.
        </p>
      )}
    </div>
  )
}
