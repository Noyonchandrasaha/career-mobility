import { Label } from "@/components/ui/label"
export function fieldId(name: string) {
  return "field-" + name.replaceAll(".", "-")
}
export function fieldAttributes(
  name: string,
  errors: Record<string, string>,
  hint?: string
) {
  return {
    id: fieldId(name),
    "aria-invalid": !!errors[name],
    "aria-describedby":
      [hint, errors[name] ? fieldId(name) + "-error" : undefined]
        .filter(Boolean)
        .join(" ") || undefined,
  }
}
export function Field({
  name,
  label,
  error,
  children,
  required = true,
  hint,
}: {
  name: string
  label: string
  error?: string
  children: React.ReactNode
  required?: boolean
  hint?: string
}) {
  return (
    <div className="min-w-0 space-y-2">
      <div className="flex items-center gap-2">
        <Label htmlFor={fieldId(name)}>{label}</Label>
        {required && (
          <span aria-hidden="true" className="text-muted-foreground">
            *
          </span>
        )}
      </div>
      {children}
      {hint && (
        <p
          id={fieldId(name) + "-hint"}
          className="text-xs leading-5 text-muted-foreground"
        >
          {hint}
        </p>
      )}
      {error && (
        <p id={fieldId(name) + "-error"} className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  )
}
export function FormSection({
  number,
  title,
  description,
  children,
}: {
  number: string
  title: string
  description: string
  children: React.ReactNode
}) {
  return (
    <section aria-labelledby={"section-" + number} className="app-card">
      <div className="mb-6 flex items-start gap-3">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-secondary text-xs font-semibold text-secondary-foreground">
          {number}
        </span>
        <div>
          <h2 id={"section-" + number} className="font-semibold">
            {title}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
      {children}
    </section>
  )
}
