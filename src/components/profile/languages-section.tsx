import { Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { LANGUAGE_PROFICIENCIES } from "@/lib/constants/domain"
import { normalize } from "@/features/matching/normalization"
import { Field, fieldAttributes, FormSection } from "./form-field"
import { ProfileSelect } from "./profile-select"
import type { DraftSectionProps } from "./section-types"
const languages = [
  "Bengali",
  "English",
  "German",
  "French",
  "Spanish",
  "Hindi",
  "Arabic",
  "Mandarin",
]
export function LanguagesSection({ draft, errors, change }: DraftSectionProps) {
  const options = [
    ...new Set([
      ...languages,
      ...draft.languages.map((row) => row.language).filter(Boolean),
    ]),
  ]
  return (
    <FormSection
      number="04"
      title="Languages"
      description="Choose your languages and the proficiency you can demonstrate."
    >
      <div
        id="field-languages"
        tabIndex={-1}
        className="space-y-4"
        aria-describedby={
          errors.languages ? "field-languages-error" : undefined
        }
      >
        {draft.languages.map((row, index) => (
          <div
            key={row.rowId}
            className="grid min-w-0 gap-4 rounded-lg border bg-background/50 p-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_44px]"
          >
            <Field
              name={`languages.${index}.language`}
              label={"Language " + (index + 1)}
              error={errors[`languages.${index}.language`]}
            >
              <ProfileSelect
                {...fieldAttributes(`languages.${index}.language`, errors)}
                required
                value={row.language}
                onChange={(event) =>
                  change(
                    "languages",
                    draft.languages.map((item, n) =>
                      n === index
                        ? { ...item, language: event.target.value }
                        : item
                    )
                  )
                }
              >
                <option value="">Select language</option>
                {options.map((language) => (
                  <option
                    key={language}
                    value={language}
                    disabled={draft.languages.some(
                      (other, n) =>
                        n !== index &&
                        normalize(other.language) === normalize(language)
                    )}
                  >
                    {language}
                  </option>
                ))}
              </ProfileSelect>
            </Field>
            <Field
              name={`languages.${index}.proficiency`}
              label={"Proficiency " + (index + 1)}
              error={errors[`languages.${index}.proficiency`]}
            >
              <ProfileSelect
                {...fieldAttributes(`languages.${index}.proficiency`, errors)}
                required
                value={row.proficiency}
                onChange={(event) =>
                  change(
                    "languages",
                    draft.languages.map((item, n) =>
                      n === index
                        ? {
                            ...item,
                            proficiency: event.target
                              .value as typeof row.proficiency,
                          }
                        : item
                    )
                  )
                }
              >
                <option value="">Select proficiency</option>
                {LANGUAGE_PROFICIENCIES.map((level) => (
                  <option key={level} value={level}>
                    {level.charAt(0).toUpperCase() + level.slice(1)}
                  </option>
                ))}
              </ProfileSelect>
            </Field>
            <Button
              type="button"
              variant="ghost"
              className="size-11 justify-self-end md:self-end"
              aria-label={"Remove language " + (index + 1)}
              onClick={() =>
                change(
                  "languages",
                  draft.languages.filter((_, n) => n !== index)
                )
              }
            >
              <Trash2 aria-hidden="true" />
            </Button>
          </div>
        ))}
        {errors.languages && (
          <p id="field-languages-error" className="text-sm text-destructive">
            {errors.languages}
          </p>
        )}
        <Button
          type="button"
          variant="outline"
          className="min-h-11 px-4"
          onClick={() =>
            change("languages", [
              ...draft.languages,
              { rowId: crypto.randomUUID(), language: "", proficiency: "" },
            ])
          }
        >
          <Plus aria-hidden="true" />
          Add language
        </Button>
      </div>
    </FormSection>
  )
}
