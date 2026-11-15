import { z } from "zod"
import { candidateProfileSchema } from "@/lib/validation/profile-schema"
import { CareerClientError } from "@/lib/client/errors"

export const DEMO_STORAGE_KEY = "career-mobility:demo:v1"
export type DemoStorage = Pick<Storage, "getItem" | "setItem">
const savedSchema = z
  .object({
    id: z.uuid(),
    candidateId: z.uuid(),
    opportunityId: z.uuid(),
    createdAt: z.iso.datetime(),
  })
  .strict()
const stateSchema = z
  .object({
    version: z.literal(1),
    candidateId: z.uuid(),
    profile: candidateProfileSchema.nullable(),
    saved: z.array(savedSchema),
  })
  .strict()
  .refine(
    (state) =>
      state.saved.every((item) => item.candidateId === state.candidateId) &&
      new Set(state.saved.map((item) => item.opportunityId)).size ===
        state.saved.length &&
      new Set(state.saved.map((item) => item.id)).size === state.saved.length,
    "Invalid demo shortlist."
  )
export type DemoState = z.infer<typeof stateSchema>

export function createDemoStore(storage: DemoStorage) {
  function write(state: DemoState) {
    const validated = stateSchema.parse(state)
    try {
      storage.setItem(DEMO_STORAGE_KEY, JSON.stringify(validated))
    } catch {
      throw new CareerClientError(
        503,
        "STORAGE_UNAVAILABLE",
        "Demo data could not be saved. Check browser storage permissions or free space, then retry."
      )
    }
  }
  function read(): DemoState {
    let raw: string | null
    try {
      raw = storage.getItem(DEMO_STORAGE_KEY)
    } catch {
      throw new CareerClientError(
        503,
        "STORAGE_UNAVAILABLE",
        "Browser storage is unavailable. Enable local storage and retry."
      )
    }
    if (raw === null) {
      const state: DemoState = {
        version: 1,
        candidateId: crypto.randomUUID(),
        profile: null,
        saved: [],
      }
      write(state)
      return state
    }
    try {
      return stateSchema.parse(JSON.parse(raw))
    } catch {
      throw new CareerClientError(
        409,
        "CORRUPT_DEMO_DATA",
        "Stored demo data is invalid. Export or clear this application's demo storage before starting again."
      )
    }
  }
  return { read, write }
}
