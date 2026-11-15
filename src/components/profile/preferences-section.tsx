import { opportunities } from "@/data"
import { COUNTRIES } from "@/lib/constants/domain"
import { Field, fieldAttributes, FormSection } from "./form-field"
import { ProfileSelect } from "./profile-select"
import type { DraftSectionProps } from "./section-types"

const interests = [
  ...new Set(opportunities.flatMap((job) => job.careerCategories)),
].sort()
function CheckGroup({
  name,
  title,
  options,
  value,
  error,
  onChange,
}: {
  name: string
  title: string
  options: string[]
  value: string[]
  error?: string
  onChange(value: string[]): void
}) {
  return (
    <fieldset
      id={"field-" + name}
      tabIndex={-1}
      aria-invalid={!!error}
      aria-describedby={error ? "field-" + name + "-error" : undefined}
    >
      <legend className="mb-3 text-sm font-medium">
        {title} <span aria-hidden="true">*</span>
      </legend>
      <div className="grid gap-2 sm:grid-cols-2">
        {options.map((option) => (
          <label
            key={option}
            className="flex min-h-11 cursor-pointer items-center gap-3 rounded-lg border px-3 py-2 text-sm has-checked:border-primary has-checked:bg-secondary has-checked:text-secondary-foreground"
          >
            <input
              type="checkbox"
              className="size-4 shrink-0 accent-primary"
              checked={value.includes(option)}
              onChange={(event) =>
                onChange(
                  event.target.checked
                    ? [...value, option]
                    : value.filter((item) => item !== option)
                )
              }
            />
            {option}
          </label>
        ))}
      </div>
      {error && (
        <p
          id={"field-" + name + "-error"}
          className="mt-2 text-sm text-destructive"
        >
          {error}
        </p>
      )}
    </fieldset>
  )
}
export function PreferencesSection({
  draft,
  errors,
  change,
}: DraftSectionProps) {
  return (
    <>
      <FormSection
        number="05"
        title="Career preferences"
        description="Choose where you would like to work and your areas of interest."
      >
        <div className="space-y-6">
          <CheckGroup
            name="preferredCountries"
            title="Preferred countries"
            options={[...new Set([...COUNTRIES, ...draft.preferredCountries])]}
            value={draft.preferredCountries}
            error={errors.preferredCountries}
            onChange={(value) => {
              const workAuthorizations = { ...draft.workAuthorizations }
              value.forEach((country) => {
                workAuthorizations[country] ??= "unknown"
              })
              change("workAuthorizations", workAuthorizations)
              change("preferredCountries", value)
            }}
          />
          <CheckGroup
            name="careerInterests"
            title="Career interests"
            options={[...new Set([...interests, ...draft.careerInterests])]}
            value={draft.careerInterests}
            error={errors.careerInterests}
            onChange={(value) => change("careerInterests", value)}
          />
        </div>
      </FormSection>
      <FormSection
        number="06"
        title="Eligibility information"
        description="Unknown is a valid answer. These declarations are not legal verification."
      >
        <div className="space-y-5">
          {draft.preferredCountries.length === 0 && (
            <p className="rounded-lg bg-muted p-3 text-sm text-muted-foreground">
              Select preferred countries to add work authorization information.
            </p>
          )}
          {draft.preferredCountries.map((country) => (
            <Field
              key={country}
              name={"workAuthorizations." + country}
              label={"Work authorization — " + country}
              required={false}
              error={errors["workAuthorizations." + country]}
            >
              <ProfileSelect
                {...fieldAttributes("workAuthorizations." + country, errors)}
                value={draft.workAuthorizations[country] ?? "unknown"}
                onChange={(event) =>
                  change("workAuthorizations", {
                    ...draft.workAuthorizations,
                    [country]: event.target.value as "yes" | "no" | "unknown",
                  })
                }
              >
                <option value="unknown">Unknown — needs verification</option>
                <option value="yes">
                  Yes — I declare that I hold authorization
                </option>
                <option value="no">No — I do not hold authorization</option>
              </ProfileSelect>
            </Field>
          ))}
          <Field
            name="studentStatus"
            label="Currently enrolled as a student?"
            required={false}
            error={errors.studentStatus}
          >
            <ProfileSelect
              {...fieldAttributes("studentStatus", errors)}
              value={draft.studentStatus}
              onChange={(event) =>
                change(
                  "studentStatus",
                  event.target.value as typeof draft.studentStatus
                )
              }
            >
              <option value="unknown">Unknown</option>
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </ProfileSelect>
          </Field>
          <p className="rounded-lg border border-warning-soft-foreground/15 bg-warning-soft p-3 text-xs leading-5 text-warning-soft-foreground">
            A profile match is not confirmation of visa or work eligibility.
            Removed country preferences retain their authorization declarations
            for future edits.
          </p>
        </div>
      </FormSection>
    </>
  )
}
