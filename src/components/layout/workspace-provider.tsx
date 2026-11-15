"use client"
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react"
import { createCareerClient } from "@/lib/client/career-client"
import type { CareerClient } from "@/types/career-client"
import type { CandidateProfile } from "@/types/domain"
import {
  draftFingerprint,
  emptyProfileDraft,
  profileToDraft,
  type ProfileDraft,
} from "@/features/candidate/profile-draft"

type Workspace = {
  status: "loading" | "ready" | "error"
  error: string | null
  client: CareerClient | null
  profile: CandidateProfile | null
  draft: ProfileDraft
  dirty: boolean
  setDraft: React.Dispatch<React.SetStateAction<ProfileDraft>>
  commitProfile(profile: CandidateProfile): void
  retry(): void
}
const Context = createContext<Workspace | null>(null)
export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const clientRef = useRef<CareerClient | null>(null)
  const [client, setClient] = useState<CareerClient | null>(null)
  const [attempt, setAttempt] = useState(0)
  const [status, setStatus] = useState<Workspace["status"]>("loading")
  const [error, setError] = useState<string | null>(null)
  const [profile, setProfile] = useState<CandidateProfile | null>(null)
  const [draft, setDraft] = useState(emptyProfileDraft)
  const load = useCallback(async () => {
    const client = (clientRef.current ??= createCareerClient())
    await client.initializeSession()
    const saved = await client.getProfile()
    return { client, saved }
  }, [])
  useEffect(() => {
    let active = true
    void load().then(
      ({ client, saved }) => {
        if (!active) return
        setClient(client)
        setProfile(saved)
        setDraft(saved ? profileToDraft(saved) : emptyProfileDraft())
        setStatus("ready")
      },
      (failure) => {
        if (!active) return
        setError(
          failure instanceof Error
            ? failure.message
            : "Could not prepare your workspace. Please retry."
        )
        setStatus("error")
      }
    )
    return () => {
      active = false
    }
  }, [load, attempt])
  const dirty =
    draftFingerprint(draft) !==
    draftFingerprint(profile ? profileToDraft(profile) : emptyProfileDraft())
  useEffect(() => {
    if (!dirty) return
    const warn = (event: BeforeUnloadEvent) => {
      event.preventDefault()
    }
    window.addEventListener("beforeunload", warn)
    return () => window.removeEventListener("beforeunload", warn)
  }, [dirty])
  const commitProfile = (saved: CandidateProfile) => {
    setProfile(saved)
    setDraft(profileToDraft(saved))
  }
  return (
    <Context.Provider
      value={{
        status,
        error,
        profile,
        draft,
        dirty,
        setDraft,
        commitProfile,
        client,
        retry: () => {
          setStatus("loading")
          setError(null)
          setAttempt((value) => value + 1)
        },
      }}
    >
      {children}
    </Context.Provider>
  )
}
export function useWorkspace() {
  const value = useContext(Context)
  if (!value) throw new Error("WorkspaceProvider is required.")
  return value
}
