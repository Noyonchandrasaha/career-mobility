"use client"
import { useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowRight, Check, Info, LoaderCircle } from "lucide-react"
import { toast } from "sonner"
import { sampleProfile } from "@/data"
import { Button } from "@/components/ui/button"
import { useWorkspace } from "@/components/layout/workspace-provider"
import {
  hasProfileContent,
  profileToDraft,
  validateProfileDraft,
  type ProfileDraft,
} from "@/features/candidate/profile-draft"
import { ProfileBasics } from "./profile-basics"
import { SkillsInput } from "./skills-input"
import { LanguagesSection } from "./languages-section"
import { PreferencesSection } from "./preferences-section"
import { FormSection, fieldId } from "./form-field"
import { SampleCandidateAction } from "./sample-candidate-action"

type Intent = "save" | "matches"
export function ProfileWorkspace() {
  const { draft, setDraft, client, profile, commitProfile, dirty } =
    useWorkspace()
  const router = useRouter()
  const lock = useRef(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitted, setSubmitted] = useState(false)
  const [pending, setPending] = useState<Intent | null>(null)
  const [failure, setFailure] = useState<string | null>(null)
  const [lastIntent, setLastIntent] = useState<Intent>("save")
  const [saved, setSaved] = useState(false)
  function change<K extends keyof ProfileDraft>(
    key: K,
    value: ProfileDraft[K]
  ) {
    setDraft((previous) => ({ ...previous, [key]: value }))
    setErrors((previous) =>
      Object.fromEntries(
        Object.entries(previous).filter(
          ([name]) => name !== key && !name.startsWith(key + ".")
        )
      )
    )
    setSaved(false)
  }
  async function save(intent: Intent) {
    if (lock.current || !client) return
    setSubmitted(true)
    setFailure(null)
    setSaved(false)
    const result = validateProfileDraft(draft)
    setErrors(result.errors)
    if (!result.profile) {
      requestAnimationFrame(() => {
        const control = document.getElementById(
          fieldId(Object.keys(result.errors)[0])
        )
        control?.focus()
        control?.scrollIntoView({ block: "center", behavior: "instant" })
      })
      return
    }
    lock.current = true
    setPending(intent)
    setLastIntent(intent)
    try {
      const persisted = await client.saveProfile(result.profile)
      commitProfile(persisted)
      setSaved(true)
      toast.success("Your career profile has been saved.")
      if (intent === "matches") router.push("/recommendations")
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Your profile could not be saved. Please retry."
      setFailure(message)
      toast.error(message)
    } finally {
      lock.current = false
      setPending(null)
    }
  }
  const sectionProps = { draft, errors, change }
  return (
    <div>
      <div className="mb-7 flex flex-col items-start justify-between gap-5 xl:flex-row xl:items-center">
        <div>
          <p className="mb-2 text-xs font-semibold tracking-widest text-primary">
            YOUR NEXT CHAPTER
          </p>
          <h1 className="text-[26px] font-bold tracking-tight md:text-3xl">
            Your Career Profile
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
            Share your background to find relevant international opportunities
            and understand the requirements you may need to meet.
          </p>
        </div>
        <SampleCandidateAction
          hasContent={hasProfileContent(draft)}
          disabled={!!pending}
          onLoad={() => {
            setDraft(profileToDraft(sampleProfile))
            setErrors({})
            setFailure(null)
            setSaved(false)
          }}
        />
      </div>
      <div className="grid min-w-0 items-start gap-8 xl:grid-cols-[minmax(0,1fr)_260px]">
        <form
          noValidate
          aria-label="Career profile"
          aria-busy={!!pending}
          onSubmit={(event) => {
            event.preventDefault()
            const intent =
              (event.nativeEvent as SubmitEvent).submitter?.getAttribute(
                "value"
              ) === "matches"
                ? "matches"
                : "save"
            void save(intent)
          }}
          className="min-w-0 space-y-8"
        >
          <p className="text-xs text-muted-foreground">
            Fields marked * are required. You can edit this profile at any time.
          </p>
          {submitted && Object.keys(errors).length > 0 && (
            <div
              role="alert"
              className="rounded-lg border border-destructive/30 bg-danger-soft p-4 text-sm text-danger-soft-foreground"
            >
              Please review the highlighted fields. Your information has not
              been saved.
            </div>
          )}
          {failure && (
            <div
              role="alert"
              className="space-y-3 rounded-lg border border-destructive/30 bg-danger-soft p-4 text-sm text-danger-soft-foreground"
            >
              <p>{failure} Your edits are still here.</p>
              <Button
                type="button"
                variant="outline"
                className="min-h-11 px-4"
                disabled={!!pending}
                onClick={() => {
                  void save(lastIntent)
                }}
              >
                Retry save
              </Button>
            </div>
          )}
          <fieldset disabled={!!pending} className="min-w-0 space-y-8">
            <legend className="sr-only">Career profile information</legend>
            <ProfileBasics {...sectionProps} />
            <FormSection
              number="03"
              title="Skills"
              description="Add specific skills you would like us to consider."
            >
              <SkillsInput
                value={draft.skills}
                onChange={(value) => change("skills", value)}
                error={errors.skills}
              />
            </FormSection>
            <LanguagesSection {...sectionProps} />
            <PreferencesSection {...sectionProps} />
          </fieldset>
          <div className="flex flex-col gap-4 rounded-xl border bg-card p-4 md:p-6">
            <div
              role="status"
              className="flex items-center gap-2 text-xs text-muted-foreground"
            >
              {saved && !dirty ? (
                <>
                  <Check className="size-4 text-success" aria-hidden="true" />
                  Profile saved.
                </>
              ) : dirty ? (
                "You have unsaved changes."
              ) : profile ? (
                "Your saved profile is up to date."
              ) : (
                "Your profile will be saved when you choose an action below."
              )}
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
              <Button
                type="submit"
                name="intent"
                value="save"
                variant="outline"
                className="min-h-12 px-5"
                disabled={!!pending}
              >
                {pending === "save" && (
                  <LoaderCircle className="animate-spin" aria-hidden="true" />
                )}
                {pending === "save" ? "Saving…" : "Save Profile"}
              </Button>
              <Button
                type="submit"
                name="intent"
                value="matches"
                className="min-h-12 px-5"
                disabled={!!pending}
              >
                {pending === "matches" ? (
                  <LoaderCircle className="animate-spin" aria-hidden="true" />
                ) : null}
                {pending === "matches" ? "Saving…" : "Save & View Matches"}
                {!pending && <ArrowRight aria-hidden="true" />}
              </Button>
            </div>
          </div>
        </form>
        <aside
          aria-label="Profile guidance"
          className="space-y-5 xl:sticky xl:top-24"
        >
          <div className="app-card space-y-4">
            <span className="flex size-10 items-center justify-center rounded-xl bg-secondary text-primary">
              <Info className="size-5" aria-hidden="true" />
            </span>
            <h2 className="text-base font-semibold">
              A clearer picture of your next move
            </h2>
            <p className="text-sm text-muted-foreground">
              Your education, experience, skills, languages and location
              preferences contribute to your profile match.
            </p>
            <div className="border-t pt-4">
              <h3 className="text-sm font-medium">
                Eligibility stays separate
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                We highlight declared gaps and unknown requirements. A high
                score does not confirm permission to work.
              </p>
            </div>
          </div>
          <p className="px-1 text-xs leading-5 text-muted-foreground">
            {client?.mode === "mock"
              ? "Demo Mode: your profile stays in this browser. Clearing browser data removes it."
              : "Your profile is linked to this browser’s anonymous session. There is no account recovery."}{" "}
            The sample candidate is illustrative.
          </p>
        </aside>
      </div>
    </div>
  )
}
