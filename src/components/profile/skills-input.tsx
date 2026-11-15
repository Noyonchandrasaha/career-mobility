"use client"
import { useState } from "react"
import { Plus, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { normalizeSkill } from "@/features/matching/normalization"
import { opportunities } from "@/data"
import { Field, fieldAttributes } from "./form-field"
const suggestions = [
  ...new Set(opportunities.flatMap((job) => job.requiredSkills)),
].sort()
export function SkillsInput({
  value,
  onChange,
  error,
}: {
  value: string[]
  onChange(value: string[]): void
  error?: string
}) {
  const [input, setInput] = useState("")
  const [notice, setNotice] = useState("")
  function add() {
    const skill = normalizeSkill(input)
    if (!skill) {
      setNotice("Enter a skill before adding it.")
      return
    }
    if (value.some((item) => normalizeSkill(item) === skill)) {
      setNotice("That skill is already selected.")
      return
    }
    onChange([...value, skill])
    setInput("")
    setNotice("Skill added.")
  }
  return (
    <div className="space-y-3">
      <Field
        name="skills"
        label="Your skills"
        error={error}
        hint="Add at least one. Common Excel aliases are combined automatically."
      >
        <div className="flex min-w-0 gap-2">
          <Input
            {...fieldAttributes(
              "skills",
              { skills: error ?? "" },
              "field-skills-hint"
            )}
            className="min-h-11"
            aria-required="true"
            list="skill-options"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault()
                add()
              }
            }}
            placeholder="Type a skill, then add"
          />
          <Button
            type="button"
            variant="outline"
            className="min-h-11 px-4"
            onClick={add}
          >
            <Plus aria-hidden="true" />
            Add
          </Button>
        </div>
        <datalist id="skill-options">
          {suggestions.map((skill) => (
            <option key={skill} value={skill} />
          ))}
        </datalist>
      </Field>
      {value.length > 0 && (
        <ul aria-label="Selected skills" className="flex flex-wrap gap-2">
          {value.map((skill, index) => (
            <li
              key={skill}
              className="flex max-w-full items-center rounded-lg border bg-secondary pl-3 text-sm text-secondary-foreground"
            >
              <span className="min-w-0 break-words">{skill}</span>
              <button
                type="button"
                className="flex size-11 shrink-0 items-center justify-center rounded-lg hover:bg-muted"
                aria-label={"Remove skill " + skill}
                onClick={() => {
                  onChange(value.filter((_, item) => item !== index))
                  setNotice("Skill removed.")
                }}
              >
                <X className="size-4" aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      )}
      <p role="status" className="sr-only">
        {notice}
      </p>
    </div>
  )
}
