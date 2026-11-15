const SKILL_ALIASES: Record<string, string> = {
  "ms excel": "excel",
  "microsoft excel": "excel",
  "ms powerpoint": "powerpoint",
  "microsoft powerpoint": "powerpoint",
}
const FIELD_ALIASES: Record<string, string> = {
  bba: "business administration",
  "business administration and management": "business administration",
  "computer science and engineering": "computer science",
}
export function normalize(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, " ")
}
export function normalizeSkill(value: string): string {
  const key = normalize(value)
  return Object.hasOwn(SKILL_ALIASES, key) ? SKILL_ALIASES[key] : key
}
export function normalizeField(value: string): string {
  const key = normalize(value)
  return Object.hasOwn(FIELD_ALIASES, key) ? FIELD_ALIASES[key] : key
}
export function uniqueSkills(values: string[]): string[] {
  return [...new Set(values.map(normalizeSkill).filter(Boolean))]
}
