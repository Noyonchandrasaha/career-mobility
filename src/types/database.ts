import type { opportunityToRow, profileToRow } from "@/lib/repositories/mappers"
type Table<Row, Insert = Row> = {
  Row: Row
  Insert: Insert
  Update: Partial<Insert>
  Relationships: []
}
type ProfileRow = ReturnType<typeof profileToRow> & {
  created_at: string
  updated_at: string
}
type OpportunityRow = ReturnType<typeof opportunityToRow> & {
  created_at: string
}
type SavedRow = {
  id: string
  candidate_id: string
  opportunity_id: string
  created_at: string
}
export type Database = {
  public: {
    Tables: {
      candidate_profiles: Table<ProfileRow, ReturnType<typeof profileToRow>>
      opportunities: Table<OpportunityRow, ReturnType<typeof opportunityToRow>>
      saved_opportunities: Table<
        SavedRow,
        {
          id?: string
          candidate_id: string
          opportunity_id: string
          created_at?: string
        }
      >
    }
    Views: { [_ in never]: never }
    Functions: { [_ in never]: never }
    Enums: { [_ in never]: never }
    CompositeTypes: { [_ in never]: never }
  }
}
