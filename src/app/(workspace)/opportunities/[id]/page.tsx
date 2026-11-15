import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { z } from "zod"
import { getPublicOpportunity } from "@/lib/repositories/public-opportunity"
import { OpportunityDetails } from "@/components/opportunities/opportunity-details"

export const metadata: Metadata = { title: "Opportunity Details" }
export const dynamic = "force-dynamic"
export default async function OpportunityPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  if (!z.uuid().safeParse(id).success) notFound()
  const opportunity = await getPublicOpportunity(id)
  if (!opportunity) notFound()
  return <OpportunityDetails key={id} initialOpportunity={opportunity} />
}
