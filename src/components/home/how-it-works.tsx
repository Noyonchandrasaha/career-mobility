import {
  UserRound,
  ListChecks,
  Bookmark,
  ShieldCheck,
  Globe2,
  SlidersHorizontal,
} from "lucide-react"
const steps = [
  {
    number: "01",
    title: "Create Your Profile",
    description:
      "Add your education, skills, experience and preferences. Keep eligibility information unknown when you are unsure.",
    icon: UserRound,
  },
  {
    number: "02",
    title: "Get Personalized Matches",
    description:
      "See ranked fictional opportunities with transparent scores, matching strengths and requirements to address.",
    icon: ListChecks,
  },
  {
    number: "03",
    title: "Explore & Save Opportunities",
    description:
      "Read the complete requirements and keep a shortlist to revisit as your profile develops.",
    icon: Bookmark,
  },
]
export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      aria-labelledby="how-heading"
      className="scroll-mt-24 border-y bg-card"
    >
      <div className="app-container py-12 md:py-16">
        <div className="max-w-xl">
          <p className="mb-3 text-xs font-semibold tracking-widest text-primary">
            A CLEARER WAY FORWARD
          </p>
          <h2
            id="how-heading"
            className="text-2xl font-bold tracking-tight md:text-3xl"
          >
            Your next step starts with a clearer picture.
          </h2>
          <p className="mt-4 text-sm leading-6 text-muted-foreground">
            Build your profile once, then explore how it compares with different
            career paths.
          </p>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {steps.map(({ number, title, description, icon: Icon }) => (
            <article
              key={number}
              className="min-w-0 rounded-xl border bg-background p-5 md:p-6"
            >
              <div className="mb-6 flex items-center justify-between">
                <span className="flex size-10 items-center justify-center rounded-lg bg-secondary text-primary">
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <span className="text-xs font-semibold text-muted-foreground">
                  {number}
                </span>
              </div>
              <h3 className="text-base font-semibold">{title}</h3>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                {description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
export function PrototypeNote() {
  return (
    <section aria-label="Prototype scope" className="app-container py-10">
      <div className="grid gap-5 sm:grid-cols-3">
        {[
          {
            icon: Globe2,
            title: "Fictional opportunities",
            text: "Structured examples across countries and career areas.",
          },
          {
            icon: SlidersHorizontal,
            title: "Explainable matching",
            text: "Consistent rules with visible strengths and gaps.",
          },
          {
            icon: ShieldCheck,
            title: "Eligibility needs verification",
            text: "Scores do not certify visas or permission to work.",
          },
        ].map(({ icon: Icon, title, text }) => (
          <div key={title} className="flex items-start gap-3">
            <Icon
              className="mt-0.5 size-5 shrink-0 text-primary"
              aria-hidden="true"
            />
            <div>
              <h2 className="text-sm font-semibold">{title}</h2>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                {text}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
