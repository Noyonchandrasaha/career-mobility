import type { Metadata } from "next"
import { RecommendationsWorkspace } from "@/components/matching/recommendations-workspace"
export const metadata: Metadata = { title: "Your Career Matches" }
export default function RecommendationsPage() {
  return <RecommendationsWorkspace />
}
