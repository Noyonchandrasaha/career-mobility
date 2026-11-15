"use client"
import { useEffect, useState } from "react"

export function useAsyncResource<T>(
  loader: (() => Promise<T>) | null,
  revision?: unknown
) {
  const [attempt, setAttempt] = useState(0)
  const [result, setResult] = useState<{
    loader: typeof loader
    attempt: number
    revision: unknown
    data?: T
    error?: unknown
  } | null>(null)
  useEffect(() => {
    if (!loader) return
    let active = true
    void loader().then(
      (data) => {
        if (active) setResult({ loader, attempt, revision, data })
      },
      (error) => {
        if (active) setResult({ loader, attempt, revision, error })
      }
    )
    return () => {
      active = false
    }
  }, [loader, attempt, revision])
  const current =
    result?.loader === loader &&
    result?.attempt === attempt &&
    result?.revision === revision
  return {
    data: current ? result.data : undefined,
    error: current ? result.error : undefined,
    loading: !!loader && !current,
    retry: () => setAttempt((value) => value + 1),
  }
}
