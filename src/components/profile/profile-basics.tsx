import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { EDUCATION_LEVELS } from "@/lib/constants/domain"
import { Field, fieldAttributes, FormSection } from "./form-field"
import { ProfileSelect } from "./profile-select"
import type { DraftSectionProps } from "./section-types"
const labels = {
  high_school: "High school",
  diploma: "Diploma",
  bachelors: "Bachelor’s degree",
  masters: "Master’s degree",
  doctorate: "Doctorate",
}
export function ProfileBasics({ draft, errors, change }: DraftSectionProps) {
  return (
    <>
      <FormSection
        number="01"
        title="Education"
        description="Tell us about your highest completed qualification."
      >
        <div className="grid gap-5 md:grid-cols-2">
          <Field
            name="educationLevel"
            label="Education level"
            error={errors.educationLevel}
          >
            <ProfileSelect
              {...fieldAttributes("educationLevel", errors)}
              required
              value={draft.educationLevel}
              onChange={(event) =>
                change(
                  "educationLevel",
                  event.target.value as typeof draft.educationLevel
                )
              }
            >
              <option value="">Select your qualification</option>
              {EDUCATION_LEVELS.map((level) => (
                <option key={level} value={level}>
                  {labels[level]}
                </option>
              ))}
            </ProfileSelect>
          </Field>
          <Field
            name="fieldOfStudy"
            label="Field of study"
            error={errors.fieldOfStudy}
          >
            <Input
              {...fieldAttributes("fieldOfStudy", errors)}
              className="min-h-11"
              required
              autoComplete="off"
              value={draft.fieldOfStudy}
              onChange={(event) => change("fieldOfStudy", event.target.value)}
              placeholder="e.g. Business administration"
            />
          </Field>
        </div>
      </FormSection>
      <FormSection
        number="02"
        title="Professional experience"
        description="Include work, research or relevant project experience."
      >
        <div className="space-y-5">
          <div className="max-w-xs">
            <Field
              name="experienceYears"
              label="Years of experience"
              error={errors.experienceYears}
              hint="Zero is valid. You can use decimals, such as 0.5."
            >
              <Input
                {...fieldAttributes(
                  "experienceYears",
                  errors,
                  "field-experienceYears-hint"
                )}
                className="min-h-11"
                type="number"
                min="0"
                step="any"
                inputMode="decimal"
                required
                value={draft.experienceYears}
                onChange={(event) =>
                  change("experienceYears", event.target.value)
                }
                placeholder="e.g. 2"
              />
            </Field>
          </div>
          <Field
            name="experienceDescription"
            label="Experience summary"
            error={errors.experienceDescription}
          >
            <Textarea
              {...fieldAttributes("experienceDescription", errors)}
              className="min-h-28"
              rows={4}
              required
              value={draft.experienceDescription}
              onChange={(event) =>
                change("experienceDescription", event.target.value)
              }
              placeholder="Describe your responsibilities, projects and areas of experience."
            />
          </Field>
        </div>
      </FormSection>
    </>
  )
}
