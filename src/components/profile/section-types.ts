import type { ProfileDraft } from "@/features/candidate/profile-draft"
export type DraftSectionProps = {
  draft: ProfileDraft
  errors: Record<string, string>
  change<K extends keyof ProfileDraft>(key: K, value: ProfileDraft[K]): void
}
