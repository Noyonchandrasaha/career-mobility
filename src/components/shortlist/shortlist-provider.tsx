"use client"
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react"
import { toast } from "sonner"
import type { SavedOpportunity } from "@/types/domain"
import { useWorkspace } from "@/components/layout/workspace-provider"

type Shortlist = {
  saved: SavedOpportunity[]
  status: "loading" | "ready" | "error"
  error: string | null
  busy: Set<string>
  errors: Record<string, string>
  retry(): void
  toggle(id: string): Promise<void>
  remove(id: string): Promise<void>
}
const Context = createContext<Shortlist | null>(null)
export function ShortlistProvider({ children }: { children: React.ReactNode }) {
  const { client } = useWorkspace()
  const [saved, setSaved] = useState<SavedOpportunity[]>([])
  const [status, setStatus] = useState<Shortlist["status"]>("loading")
  const [error, setError] = useState<string | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [attempt, setAttempt] = useState(0)
  const [busy, setBusy] = useState(new Set<string>())
  const locks = useRef(new Set<string>())
  useEffect(() => {
    if (!client) return
    let active = true
    void client.getSaved().then(
      (items) => {
        if (!active) return
        setSaved(
          items.map(({ id, candidateId, opportunityId, createdAt }) => ({
            id,
            candidateId,
            opportunityId,
            createdAt,
          }))
        )
        setStatus("ready")
        setError(null)
      },
      (failure) => {
        if (!active) return
        setError(
          failure instanceof Error
            ? failure.message
            : "Could not load saved state."
        )
        setStatus("error")
      }
    )
    return () => {
      active = false
    }
  }, [client, attempt])
  const retry = useCallback(() => {
    setStatus("loading")
    setError(null)
    setAttempt((value) => value + 1)
  }, [])
  async function mutate(id: string, removeOnly = false) {
    if (!client || status !== "ready" || locks.current.has(id)) return
    locks.current.add(id)
    setBusy(new Set(locks.current))
    setErrors((previous) => {
      const next = { ...previous }
      delete next[id]
      return next
    })
    try {
      const existing = saved.find((item) => item.opportunityId === id)
      if (removeOnly && !existing) return
      if (existing) {
        await client.removeSaved(existing.id)
        setSaved((previous) =>
          previous.filter((item) => item.id !== existing.id)
        )
        toast.success("Opportunity removed from saved.")
      } else {
        const persisted = await client.saveOpportunity(id)
        setSaved((previous) =>
          previous.some((item) => item.opportunityId === id)
            ? previous
            : [persisted, ...previous]
        )
        toast.success("Opportunity saved.")
      }
    } catch (failure) {
      const message =
        failure instanceof Error
          ? failure.message
          : "The saved state could not be updated. Please retry."
      setErrors((previous) => ({ ...previous, [id]: message }))
      toast.error(message)
    } finally {
      locks.current.delete(id)
      setBusy(new Set(locks.current))
    }
  }
  return (
    <Context.Provider
      value={{
        saved,
        status,
        error,
        busy,
        errors,
        retry,
        toggle: (id) => mutate(id),
        remove: (id) => mutate(id, true),
      }}
    >
      {children}
    </Context.Provider>
  )
}
export function useShortlist() {
  const value = useContext(Context)
  if (!value) throw new Error("ShortlistProvider is required.")
  return value
}
