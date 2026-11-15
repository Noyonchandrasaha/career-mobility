import type { Metadata } from "next"
import { SavedWorkspace } from "@/components/shortlist/saved-workspace"
export const metadata: Metadata = { title: "Saved Opportunities" }
export default function SavedPage() {
  return <SavedWorkspace />
}
