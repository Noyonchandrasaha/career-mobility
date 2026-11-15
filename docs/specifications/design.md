# CAREER MOBILITY PLATFORM — DESIGN SYSTEM & IMPLEMENTATION GUIDE

**Version:** 1.0 · **Status:** Binding UI implementation specification · **Date:** 15 November 2026  
**Stack:** Next.js App Router, React, TypeScript, Tailwind CSS v4, shadcn/ui, Supabase  
**Project files:** `src/app/globals.css` (companion file supplied), `src/components/`, `src/features/`, `src/app/`  
**Sources of requirements:** 7-page *Career Mobility Platform Technical Assessment*, approved PRD v2.0, and `career_mobility_screen_by_screen_blueprint.md`.

> **Hierarchy if documents differ:** Original assessment (mandatory scope) → approved PRD v2.0 (technical decisions) → screen-by-screen blueprint (information architecture) → this design guide (visual, responsive, implementation rules). This guide does not add email/password login, a new dashboard route, or a separate backend. Five primary routes: `/`, `/profile`, `/recommendations`, `/opportunities/[id]`, `/saved`. A dashboard-like shell is used for the recommendations workspace. Supabase Anonymous Auth and mock mode remain as previously agreed.

## 1. Goals, quality bar, and non-goals

### UX goals
- Answer immediately: **What is this role? Why does it match? What is missing? Does eligibility need verification? Can I save it?**
- Optimize for the assessment's single full journey: profile → scored recommendations → detail → shortlist → edit profile and recompute.
- Keep data truthful: these are **fictional sample opportunities**; do not show Apply Now to a real organization, live vacancy count, fake user profile/avatar, verified immigration claims, or unimplemented controls.
- Avoid a visual-only mockup: every button, chip, navigation item, and state must have a defined response.
- Functional correctness, explainability, keyboard accessibility, and mobile usability matter more than decorative animation.

### Visual direction
**Professional career workspace:** bright cool-neutral canvas, white crisp surfaces, measured blue accents, high-contrast typography, subtle borders, restrained depth, generous whitespace. Use a design language suitable for a trustworthy career analytics tool, not a social network or recruitment marketing template. No ornamental 3D blobs, stock-portrait hero, fake charts, or heavy gradients.

### Fixed decisions
| Area | Decision |
|---|---|
| Theme | **Light only for assessment MVP**, no theme switcher; semantic variables allow later expansion |
| Brand | Working text mark **Career Mobility**, optional simple compass/briefcase icon; no invented sponsor logo |
| Typeface | Inter via `next/font/google`, with system fallback |
| Icons | `lucide-react` (consistent 18–20 px navigation, 16 px inline, 20–24 px action) |
| Layout | Public home plus responsive authenticated application shell; sidebar from 1024px |
| Forms | shadcn/ui fields; use semantic HTML, Zod validation, React state; no need for a second form library |
| Toast | shadcn-compatible Sonner for **actual mutation feedback**, not for informational page loads |
| Charts | Do not add chart dependency; horizontal score bars rendered with CSS and text |
| Motion | Subtle opacity/transform transitions, 120–240ms; respect reduced-motion |
| Spacing | 4px base rhythm; explicit responsive scales below |
| Color | Theme tokens only in components; source is `globals.css` |

---

## 2. Token governance and actual files

### Must-have rules
1. Copy the **accompanying `globals.css`** into `src/app/globals.css` unchanged initially.
2. `src/app/layout.tsx` imports it exactly once.
3. Define / change global colors only in `:root` and the corresponding `@theme inline` mappings.
4. Components must use semantic utilities, e.g. `bg-background`, `bg-card`, `text-foreground`, `text-muted-foreground`, `border-border`, `bg-primary`, `text-primary-foreground`, `bg-success-soft`.
5. **Prohibited in JSX/TSX**: `#hex`, `rgb(...)`, `hsl(...)`, `oklch(...)`, `text-[#...]`, `bg-[#...]`, inline `style={{ color: ... }}`, gradients with arbitrary color stops.
6. If a new semantic state is truly necessary, add paired variables (`--token` and foreground variant when relevant), map them in `@theme inline`, then document use.
7. Do not override generated shadcn primitives globally merely to accommodate one screen. Prefer wrapper components and variants.
8. Do not create a competing `tailwind.config.js` color palette. Tailwind v4 CSS theme is the source of truth.

### Complete brand/state palette
| Semantic purpose | Token | HEX | Usage |
|---|---|---|---|
| App canvas | `--background` | `#F8FAFC` | Page/workspace background |
| Primary text | `--foreground` | `#0F172A` | Headings, readable body |
| Surface/card | `--card` | `#FFFFFF` | Cards, panels |
| Muted surface | `--muted` | `#F1F5F9` | Inactive blocks, skeletons |
| Secondary text | `--muted-foreground` | `#64748B` | Metadata, descriptions |
| Primary action | `--primary` | `#2563EB` | Main CTA, active indicator |
| Primary action text | `--primary-foreground` | `#FFFFFF` | Text on primary |
| Soft blue | `--secondary` | `#EFF6FF` | Active sidebar, informational surfaces |
| Blue ink | `--secondary-foreground` | `#1E40AF` | Blue on soft blue |
| Borders | `--border` | `#E2E8F0` | Dividers, cards |
| Inputs | `--input` | `#CBD5E1` | Default input stroke |
| Focus | `--ring` | `#2563EB` | Focus indicator |
| Success text | `--success` | `#059669` | Qualified indicators |
| Success surface | `--success-soft` | `#ECFDF5` | No identified blocker |
| Success ink | `--success-soft-foreground` | `#065F46` | Status text |
| Warning text | `--warning` | `#B45309` | Verify requirement |
| Warning surface | `--warning-soft` | `#FFFBEB` | Eligibility uncertainty |
| Warning ink | `--warning-soft-foreground` | `#92400E` | Status text |
| Error | `--destructive` | `#DC2626` | Error + destructive actions |
| Error surface | `--danger-soft` | `#FEF2F2` | Blocked/error notification |
| Error ink | `--danger-soft-foreground` | `#991B1B` | Blocked explanation |

**Contrast note:** Use the darker status ink on pale status backgrounds. Do not use bright success/amber values for long-form small text. Score is not a legal eligibility claim: use neutral or brand text for raw match score; status color is reserved for explicit status.

### Allowed utility examples
```tsx
<div className="rounded-xl border border-border bg-card p-4 shadow-sm">
  <h2 className="text-lg font-semibold text-foreground">Programme Assistant</h2>
  <p className="mt-1 text-sm text-muted-foreground">Fictional NGO · Canada</p>
  <span className="inline-flex rounded-full bg-warning-soft px-2.5 py-1 text-xs font-medium text-warning-soft-foreground">
    Requires verification
  </span>
</div>
```

### Radius & elevation
| Use | Token / class | Value |
|---|---|---|
| Inputs and small chips | `rounded-md` | 8px equivalent (radius-md derives from base) |
| Primary card | `rounded-xl` | 16px derived token |
| General card/panel | `rounded-lg` | 12px base |
| Pill/status badge | `rounded-full` | Full |
| Card elevation | `--shadow-card` | Subtle 2-layer shadow |
| Popover elevation | `--shadow-popover` | Stronger than cards |

Use one visual language; never mix arbitrary 6px, 13px, 19px radii across screens. Prefer borders over shadows for information cards. Avoid hover elevation jumps.

---

## 3. Spacing system

### Base scale (Tailwind v4 utility equivalents)
| Token | Pixel | Typical use |
|---|---:|---|
| `1` | 4 | Icon/text micro spacing |
| `1.5` | 6 | Small label gap |
| `2` | 8 | Inline icon gap, tiny stack |
| `3` | 12 | Field help, tight control |
| `4` | 16 | Mobile card padding, standard control gap |
| `5` | 20 | Compact groups |
| `6` | 24 | Desktop card internals |
| `8` | 32 | Page section/card separation |
| `10` | 40 | Mobile section gap |
| `12` | 48 | Tablet section gap |
| `16` | 64 | Desktop marketing section gap |
| `20` | 80 | Hero vertical rhythm only |

### Global responsive variables from CSS
| Variable | Mobile <768 | Tablet 768–1023 | Desktop ≥1024 |
|---|---|---|---|
| `--page-gutter` | 16px | 24px | 32px |
| `--page-block` | 24px | 32px | 40px |
| `--section-gap` | 40px | 48px | 64px |
| `--card-pad` | 16px | 20px | 24px |
| `--control-height` | 44px | 44px | 44px |
| `--content-max` | up to 1200px | up to 1200px | 1200px |
| `--reading-max` | up to 736px | 736px | 736px |
| `--sidebar-width` | none | none | 240px |
| `--topbar-height` | 68px | 68px | 68px |

**Never** apply large hero paddings to all app pages. Public home may use `py-16 md:py-20`; application pages use `.app-page`.

### Element spacing contracts
- Page heading → description: 8px.
- Page heading group → main content: 24px mobile, 32px desktop.
- Card header → card body: 16px.
- Card vertical content stack: 12–16px.
- Form label → field: 8px.
- Field → supporting/error text: 6px.
- One form field → next: 20–24px.
- Form section title → fields: 20px.
- Form sections: 32px mobile, 40px desktop.
- Badge/icon: 6–8px internal visual gap.
- Button icon → text: 8px.
- Repeated job cards: 16px mobile, 20px desktop.

---

## 4. Typography scale & text rules

### Font installation (Next.js App Router)
```tsx
// src/app/layout.tsx
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.variable}>{children}</body>
    </html>
  );
}
```

Only light theme is implemented. Do not add `next-themes` or a theme toggle in this MVP.

### Typography contract
| Role | Mobile | Tablet | Desktop | Weight | Line height |
|---|---|---|---|---|---|
| Home hero H1 | 32px | 40px | 48px | 700 | 1.12 |
| App page H1 | 26px | 30px | 32px | 700 | 1.2 |
| Section H2 | 21px | 22px | 24px | 650/700 | 1.3 |
| Card heading H3 | 17px | 18px | 18px | 600 | 1.35 |
| Body | 15px | 16px | 16px | 400 | 1.6 |
| Small/metadata | 14px | 14px | 14px | 400–500 | 1.45 |
| Label | 14px | 14px | 14px | 500 | 1.4 |
| Caption | 12px | 12px | 12px | 400–500 | 1.4 |
| Match score | 28px | 30px | 32px | 700 | 1.0 |

Tailwind examples (use `leading-*` explicit where needed):
- Hero: `text-[32px] leading-[1.12] font-bold md:text-[40px] lg:text-5xl` (font sizes are permitted; only **colors** must use tokens).
- Page H1: `text-[26px] leading-tight font-bold md:text-3xl lg:text-[32px]`.
- Body: `text-[15px] leading-6 md:text-base`.
- Metadata: `text-sm text-muted-foreground`.
- Captions: `text-xs leading-5 text-muted-foreground`.

Headings must follow semantic HTML hierarchy. Do not style every heading as H1. For long role titles, permit 2 lines then wrap naturally; avoid truncating meaningful requirements.

---

## 5. Responsive architecture

### Fixed breakpoint policy
- **320–639px** small phones: 1 column, full-width primary CTA, compact controls.
- **640–767px** large phones: still drawer navigation; two-column cards only where no readability loss.
- **768–1023px** tablet: drawer navigation, 2-column summaries and profile fields where appropriate.
- **≥1024px** desktop: 240px fixed/sticky sidebar + remaining main content; details sidebar allowed.
- **≥1280px** wide desktop: preserve 1200px content max; do not stretch the reading column endlessly.

### Common width formula
- Main workspace width on desktop: `calc(100% - var(--sidebar-width))`.
- Shell must not create body-level horizontal scrolling.
- Children in flex/grids must use `min-w-0` to allow wrapping.
- Use `grid-cols-1 md:grid-cols-2` for forms, but not for dense multi-line field groups that need full width.
- Recommendation list stays a **single column** at all widths for rich explanatory cards; summary stats can be 2 columns mobile and 4 desktop.
- Opportunity detail content: 1 column mobile/tablet, 2 columns (`minmax(0, 1fr)` + ~320px rail) at ≥1024px.

### Screen size QA
Check at: **320×568**, **375×812**, **390×844**, **768×1024**, **1024×768**, **1280×800**, **1440×900**, **1920×1080**.

At each width: no clipped content, no button hidden by sticky elements, no card overflow, readable long titles, functional drawer, visible focus, and appropriately-sized inputs.

### Touch / scroll behavior
- Minimum interactive target: 44×44px.
- Primary form button minimum height: 44px, recommended 48px.
- Drawer: max-width 320px or 85vw, whichever is smaller.
- Sidebar only after `lg`, avoid flicker during hydration.
- Sticky mobile actions may be used **only** if they do not conceal form errors or the phone keyboard; a standard bottom form action is safer.
- Use `scroll-mt-20` for anchored content under sticky topbar.

---

## 6. Application shell: desktop sidebar + topbar + mobile drawer

### Layout decisions
- Public home can reuse the shared topbar; on desktop the five screen blueprint uses an app shell. Keep the primary home `/` legible without an unnecessary analytics dashboard.
- Desktop sidebar: white, right border, width 240px, full viewport height or sticky, scrolls internally if needed.
- Topbar: height 68px, white, bottom border; at desktop, sits to the right of sidebar.
- Main: background canvas, `min-w-0`, main content `.app-container` and `.app-page`.
- A skip link points to `#main-content`.

### Sidebar exact inventory
1. Brand `Career Mobility` → `/`.
2. `Overview` (House icon) → `/`.
3. `My Profile` (UserRound icon) → `/profile`.
4. `Recommendations` (BriefcaseBusiness icon) → `/recommendations`.
5. `Saved Jobs` (Bookmark icon) → `/saved`.
6. Divider.
7. `How Matching Works` (CircleHelp icon) → `/#how-it-works` (optional, functional link).
8. Bottom small note: `Assessment prototype · Fictional opportunities`.

**Do not add:** Inbox, Billing, Settings, Employer, Applications, Notifications, Chat, AI Chat, logout for anonymous accounts, fake counters, or fabricated profile avatars.

### Navigation item anatomy
- Height 44px; horizontal padding 12px; icon 18–20px; 12px icon-label gap.
- Inactive text: `text-sidebar-foreground`, hover: `bg-muted`.
- Active: `bg-sidebar-accent text-sidebar-accent-foreground font-medium`; active indicator 3px blue only if consistent with layout.
- Link has `aria-current="page"` when appropriate.
- Saved count only if backed by actual data.

### Topbar exact inventory
- Mobile/tablet: menu button, brand mark, contextual action if space.
- Desktop: breadcrumb (`Home / Recommendations`, etc.) aligned left.
- Right: `Demo Mode` indicator only in mock mode; `Create/Edit Profile` link.
- No notification bell, theme toggle, account dropdown, generic search with no functionality.

### Mobile drawer
Use `Sheet`, `SheetTrigger`, `SheetContent`, `SheetTitle` from shadcn/ui. Accessible title required. On nav selection, close drawer. Mirror sidebar navigation without inventing mobile-only destinations.

### Breadcrumb policy
- `/`: Home.
- `/profile`: Home / My Profile.
- `/recommendations`: Home / Recommendations.
- `/opportunities/[id]`: Recommendations / Opportunity Details.
- `/saved`: Home / Saved Jobs.

Breadcrumbs are links where the destination exists, except the current page.

---

## 7. Screen-specific design contracts

### S01 — Public home `/`
**Goal:** introduce the product, explain the three-step process, lead to profile creation. No sidebar required on public landing presentation; use shared brand/top navigation.

**Order:**
1. Header: Brand left, Profile / Recommendations / Saved right (collapse on mobile).
2. Hero: eyebrow (`INTERNATIONAL CAREER MOBILITY`), H1, 2-line supporting statement, primary CTA `Create My Career Profile`, secondary `How It Works`.
3. Right/under hero: minimalist **static data illustration** showing skills → match score → verification, clearly labeled example rather than real recommendation. No misleading generated statistics.
4. How it works: 3 equal step cards desktop, 1 column mobile.
5. Scope/trust strip: `Fictional opportunities`, `Explainable matching`, `Eligibility needs verification`.
6. Footer: product name, prototype notice.

**Desktop:** hero 2 columns (text 55%, visual 45%), max-width 1200px; top padding 72–80px. **Mobile:** one column, H1 32px, actions stack, graphic below copy. **CTA:** blue filled 48px high; secondary outlined.

**Key files:** `src/app/page.tsx`, `src/components/home/hero-section.tsx`, `how-it-works.tsx`, `match-preview.tsx`, `prototype-note.tsx`.

### SYS01 — Session initialization (no login screen)
- On entering profile-dependent workflows, check Supabase session; if missing, create **anonymous** session.
- While pending: loading skeleton/neutral spinner, not a blank full-page flicker.
- On failure: concise error + retry; no fake authenticated state.
- In mock mode, skip Supabase and display Demo Mode only when true.
- This is application state, **not** `/login` or `/register`.

**Visuals:** centered loader in content area, short `Preparing your workspace…` message and unobtrusive retry UI.

### S02 — Profile `/profile`
**Goal:** structured profile creation/editing, not a multi-page wizard. Use one scannable long form with section navigation optional.

**Layout:**
- Heading `Your Career Profile` + 1-line context.
- Desktop: form main column max 760–800px, optional 280px quiet side note `How matching uses your information`; mobile: full width.
- Sections separated with generous 32–40px gaps and subtle cards/dividers:
  1. **Education:** Level select; Field of study text.
  2. **Professional experience:** years number; description textarea.
  3. **Skills:** chip input, add/remove, suggestions only if real defined dataset.
  4. **Languages:** repeatable rows (language + level + remove).
  5. **Career preferences:** countries multi-select; career interest multi-select.
  6. **Eligibility:** per-country work authorization (`Yes`, `No`, `Unknown`); current enrollment (`Yes`, `No`, `Unknown`); explanatory warning that status is candidate-provided.
- Footer actions: `Save Profile` secondary, `Save & View Matches` primary. On first creation, label is still consistent.

**Field structure:** `FieldLabel` → Input/Select → hint or inline error. Minimum 44px height. Use neutral optional labels explicitly. Error message `text-destructive text-sm`; red border `border-destructive` for invalid. Validation on submit; clear individual error as corrected.

**States:** initial skeleton, prefilled edit, clean empty, dirty, invalid, saving, success (toast), save failure (inline + toast). Do not auto-navigate on failed save.

**Mobile:** all fields one column; language row stacks neatly; button group stacks; never make chips overflow horizontally.

**Key files:** `src/app/profile/page.tsx`, `src/components/profile/*`, `src/lib/validation/profile-schema.ts`.

### S03 — Recommendations `/recommendations` (main dashboard-style workspace)
**Goal:** convey match relevance and eligibility uncertainty quickly.

**Top-to-bottom order:**
1. Breadcrumb and page heading: `Your Career Matches`; subtitle: `Ranked by criteria and eligibility requirements`.
2. Profile summary strip: education, experience, preferred countries, `Edit Profile` link.
3. Stat cards: `Opportunities Evaluated`, `No Identified Blocker`, `Needs Verification`, `Blocked`. Derive from live calculation, never hardcode.
4. Short contextual banner: `Match score reflects profile alignment—not confirmed legal eligibility.`
5. Rank methodology hint/short description: eligibility group first, then match score.
6. Ranked list of cards.

**Job card anatomy:**
- Row A: title, organization, city/country, employment type; right aligned score 28–32px.
- Row B: eligibility status badge; matched skills in small chips or concise text.
- Row C: 1–2 strengths, 1 primary gap/verification warning.
- Row D: `View Details` (primary/outline), bookmark icon button (with real `aria-label`, `aria-pressed`).
- Match score bar may be used; label score explicitly; never only show color.

**Card dimensions:** padding 16px mobile, 24px desktop; gap 12–16px; cards single-column; min card width 0.

**Badge semantics:**
- `No identified blocker`: green soft, text explicitly says **not legal verification**.
- `Requires verification`: amber soft.
- `Blocked`: red soft.

**States:** no profile redirect/CTA, loading skeleton, data failure retry, zero opportunities, no strong matches (still show real results), save pending/failed. No fabricated percentages.

**Desktop stats:** `grid grid-cols-2 xl:grid-cols-4 gap-3 md:gap-4`; **mobile:** 2 columns; labels wrap without overflow.

**Key files:** `src/app/recommendations/page.tsx`, `src/components/matching/*`, `src/components/opportunities/opportunity-card.tsx`.

### S04 — Opportunity details `/opportunities/[id]`
**Goal:** complete requirements and transparent candidate-specific match.

**Desktop two-column:** Main 2/3 with role header and descriptions; right ~320px with score, eligibility, shortlist. Keep action rail sticky only if it fits viewport and never covers content.

**Order:**
1. Back to Recommendations link.
2. Role title, organization, location, employment type.
3. Prominent score + status on mobile before descriptions.
4. Role description + responsibilities if provided.
5. Required skills (matched and missing visually and textually differentiated).
6. Experience/education/language/eligibility requirement blocks.
7. Match analysis breakdown (5 criteria with label, numeric/normalized value, why).
8. Strengths, gaps, and mandatory warnings.
9. Save / Remove Saved action.

**Rules:** use only seeded content, show missing profile CTA if match data unavailable, no real Apply button, no links to invented organizations. Invalid ID → not found.

**Components:** `OpportunityHeader`, `RequirementsSection`, `RequirementRow`, `MatchBreakdown`, `EligibilityAlert`, `SaveOpportunityButton`.

### S05 — Saved `/saved`
**Goal:** revisit or remove shortlisted opportunities.

**Layout:** heading `Saved Opportunities` + actual count; single-column list of compact job cards (title, organization, country, current match status/score if profile exists, `View Details`, `Remove`).

**States:** list loading, no saved entries with CTA to Recommendations, remove pending, failure with retry, inactive saved listing with `Unavailable` if applicable.

**Mobile:** single-column; icon-only remove must have explicit screen-reader label. **No** destructive confirm dialog needed for simple reversible bookmark removal; communicate the result.

---

## 8. Core components & design contracts

| Component | Canonical path | Inputs | Interaction / visual rules |
|---|---|---|---|
| `AppShell` | `components/layout/app-shell.tsx` | `children` | Renders sidebar at `lg`, topbar, main `min-w-0` |
| `DesktopSidebar` | `components/layout/desktop-sidebar.tsx` | `activePath?` | 240px, fixed/sticky, real links only |
| `MobileNav` | `components/layout/mobile-nav.tsx` | route | shadcn Sheet, closes on click |
| `Topbar` | `components/layout/topbar.tsx` | title/breadcrumb | 68px, only functional controls |
| `PageHeading` | `components/layout/page-heading.tsx` | title, description, actions? | H1 + optional action, responsive wrap |
| `BrandMark` | `components/layout/brand-mark.tsx` | optional compact | Typographic text icon, home link |
| `ProfileField` | `components/profile/profile-field.tsx` | id,label,error,hint,children | Label+control+error semantics |
| `SkillsInput` | `components/profile/skills-input.tsx` | value,onChange,disabled | Controlled tags, dedupe normalized inputs |
| `LanguagesInput` | `components/profile/languages-input.tsx` | rows,onChange | Add/edit/remove, unique language |
| `CountrySelect` | `components/profile/country-select.tsx` | values,onChange | Multiple countries, keyboard operable |
| `EligibilityFields` | `components/profile/eligibility-fields.tsx` | countries,status,onChange | unknown allowed; no legal judgement |
| `StatCard` | `components/matching/stat-card.tsx` | label,value,description? | Tokenized surface, readable counts |
| `MatchScore` | `components/matching/match-score.tsx` | score, size? | 0–100, no misleading eligibility tint |
| `MatchBreakdown` | `components/matching/match-breakdown.tsx` | criteria | numeric+semantic labels; accessible bars |
| `EligibilityBadge` | `components/matching/eligibility-badge.tsx` | status | 3 exact status states, tokens only |
| `EligibilityAlert` | `components/matching/eligibility-alert.tsx` | status,warnings | never imply visa verification |
| `OpportunityCard` | `components/opportunities/opportunity-card.tsx` | opportunity,match?,saved? | title, location, score, status, actions |
| `SaveButton` | `components/shortlist/save-opportunity-button.tsx` | opportunityId,isSaved,onSavedChange? | disabled pending, updates on confirmed mutation |
| `EmptyState` | `components/feedback/empty-state.tsx` | icon,title,body,action? | meaningful state-specific CTA |
| `ErrorState` | `components/feedback/error-state.tsx` | title,message,onRetry? | never expose raw secret/error trace |
| `LoadingSkeleton` | `components/feedback/loading-skeleton.tsx` | variant | stable height, no layout jump |

### Component API model: reusable should mean focused
```ts
export type EligibilityStatus =
  | "no_identified_blocker"
  | "requires_verification"
  | "blocked";

export interface EligibilityBadgeProps {
  status: EligibilityStatus;
  size?: "sm" | "md";
  className?: string;
}
```

Rules: all public props typed; prefer primitive/domain identifiers to gigantic configurable objects; if component exceeds ~200 lines, split **only when** responsibilities are separable; never create `shared.tsx` dumping unrelated widgets.

---

## 9. Folder structure — mandatory convention for any NEW component

```text
src/
├── app/
│   ├── layout.tsx
│   ├── globals.css                # companion file: global tokens / reset / utilities
│   ├── (public)/
│   │   └── page.tsx               # route /
│   ├── (workspace)/
│   │   ├── layout.tsx             # workspace shell: sidebar/topbar
│   │   ├── profile/page.tsx
│   │   ├── recommendations/page.tsx
│   │   ├── opportunities/[id]/page.tsx
│   │   └── saved/page.tsx
│   └── api/                       # existing PRD route handlers
│       ├── profile/route.ts
│       ├── opportunities/route.ts
│       ├── opportunities/[id]/route.ts
│       ├── match/route.ts
│       ├── saved/route.ts
│       └── saved/[id]/route.ts
├── components/
│   ├── ui/                        # shadcn generated primitives ONLY
│   ├── layout/                    # app-shell, topbar, sidebar, mobile-nav, page-heading
│   ├── home/                      # hero-section, how-it-works, match-preview
│   ├── profile/                   # candidate form fields and controlled inputs
│   ├── matching/                  # score, badges, breakdown, statistics
│   ├── opportunities/             # cards, detail sections, requirements
│   ├── shortlist/                 # save button, saved list
│   └── feedback/                  # empty, error, skeleton
├── features/
│   ├── candidate/                 # domain operations, data shaping
│   ├── opportunities/
│   ├── matching/                  # pure matching engine; no UI imports
│   └── shortlist/
├── lib/
│   ├── supabase/                  # server/client code
│   ├── repositories/              # data access
│   ├── validation/                # Zod schemas
│   ├── mock/                      # mock persistence adapters
│   ├── constants/                 # stable nav config, option IDs, eligibility labels
│   └── utils.ts                   # cn helper
├── types/                          # shared contracts
└── data/                           # 15 fictional opportunities, sample profile
```

**Route groups `(public)` / `(workspace)` do NOT alter URLs.** This is a presentational refinement to the earlier blueprint; keep one actual `/` page and do not duplicate `src/app/page.tsx` if using `(public)/page.tsx`.

### File placement decision tree
1. **shadcn primitive**? → `src/components/ui/` (CLI-generated; avoid business state here).
2. **Shared app frame** (sidebar, header, page heading)? → `src/components/layout/`.
3. **Repeated UI specific to a product domain**? → `src/components/{profile|matching|opportunities|shortlist}/`.
4. **Small purely visual generic feedback**? → `src/components/feedback/`.
5. **Business calculation**? → `src/features/<domain>/`, never a React component.
6. **Data fetching/database**? → `src/lib/repositories/` or `src/lib/supabase/`.
7. **Validation**? → `src/lib/validation/`.
8. **A screen's composition only**? → place composition directly in `src/app/.../page.tsx`; extract when it makes reuse/clarity better.

### Naming conventions
- Component filenames `kebab-case.tsx` (`eligibility-badge.tsx`), exports `PascalCase` (`EligibilityBadge`).
- Hooks `use-*.ts` only if needed; do not create global hooks for one onClick handler.
- Constants `UPPER_SNAKE_CASE` for configuration values and arrays.
- Test beside domain logic or under `tests/` with `.test.ts(x)`; stay consistent.
- `index.ts` barrel optional within a domain, not required; avoid circular exports.
- One meaningful component per file unless tightly-coupled private subcomponent.
- Type definitions either beside feature or in `src/types` when shared in multiple features.

### Creating a new component: 11-step workflow
1. Confirm it is used by an existing screen or required user state.
2. Find existing shadcn primitive first; do not duplicate Button, Card, Input, Badge, Sheet, Select.
3. Pick directory using placement decision tree above.
4. Define narrow TypeScript props and defaults; specify loading/disabled/error behavior.
5. Decide whether state lives in parent (preferred) or locally (pure UI interactions).
6. Use **semantic tokens only** and specified spacing/radius/typography.
7. Build mobile first; add `md:`/`lg:` only where needed.
8. Ensure real labels, focus, keyboard use, 44px touch targets, ARIA state.
9. Provide all relevant states and use real navigation/mutation; no dummy onClick.
10. Check 320px and 1440px, long labels, and reduced motion.
11. Add tests for any business behavior and document new reusable API if widely used.

### Sample custom component (do not modify `ui/badge.tsx` for this)
```tsx
// src/components/matching/eligibility-badge.tsx
import { cn } from "@/lib/utils";

type EligibilityStatus =
  | "no_identified_blocker"
  | "requires_verification"
  | "blocked";

const styles: Record<EligibilityStatus, string> = {
  no_identified_blocker: "bg-success-soft text-success-soft-foreground",
  requires_verification: "bg-warning-soft text-warning-soft-foreground",
  blocked: "bg-danger-soft text-danger-soft-foreground",
};

const labels: Record<EligibilityStatus, string> = {
  no_identified_blocker: "No identified blocker",
  requires_verification: "Requires verification",
  blocked: "Blocked",
};

export function EligibilityBadge({
  status,
  className,
}: {
  status: EligibilityStatus;
  className?: string;
}) {
  return (
    <span className={cn("inline-flex items-center rounded-full px-3 py-1 text-xs font-medium", styles[status], className)}>
      {labels[status]}
    </span>
  );
}
```

**Note:** `No identified blocker` means **no blocker found in the configured information**, not verified legal permission. The details page should include a permanent explanatory notice.

---

## 10. Next.js App Router component boundaries

### Server Components (default)
- Page data loading, Opportunity details, recommendation evaluation invocation, header with server-resolved data as needed.
- Repository reads via authenticated Supabase server client.
- Use `notFound()` for invalid IDs.
- Never access browser `localStorage` in server components.

### Client Components (`"use client"` only where needed)
- Mobile navigation Sheet trigger/control.
- Profile form inputs.
- Save/remove shortlist button.
- Interactive multi-select/chip inputs.
- Toast feedback.
- Mock mode localStorage access after mounting.

### Mutations
- Prefer explicit POST/PUT/DELETE Route Handlers already in PRD.
- Show pending state; disable duplicate submission; update state only on server-confirmed success.
- After mutation, refresh server data where appropriate (`router.refresh()`), preserve user scroll when possible.
- Never bundle a service-role key into client JS.

### Example shell layering
```text
RootLayout                         Server: font + globals + metadata
├── Public route group            Server: landing only
└── Workspace route group
    └── WorkspaceLayout           Server: structural layout
        ├── DesktopSidebar        mostly Server or link-only
        ├── Topbar                Server + small client mobile-nav island
        └── Main#main-content     page content
            └── Screen page       Server data + targeted client components
```

**Supabase nuance:** use the officially supported current SSR client/session pattern for the installed Supabase SDK, and never trust a browser-provided user ID. Mock mode is an explicitly labeled local demo adapter, not secure persistence.

---

## 11. Interaction and state design (mandatory)

### Buttons
| Variant | When | Styling |
|---|---|---|
| Primary | Save & View Matches, Create Profile | solid blue `bg-primary`, white text, 44–48px |
| Secondary / outline | Save only, Back, View Details | white/card, border, dark text |
| Ghost | sidebar tertiary, icon actions | transparent, hover muted |
| Destructive | only truly destructive operations | red semantic text/surface |

- Loading buttons show spinner + clear label (`Saving…`), retain width, disabled.
- Every icon-only button has `aria-label` and a visible focus ring.
- Save button text state: `Save opportunity` ↔ `Saved` (or `Remove from saved` on saved page). `aria-pressed` must reflect state.

### Form fields
- Labels always visible (no placeholder-only labels).
- Required fields visually marked and stated in assistive semantics.
- Help text explains eligibility information is user-declared and may be unknown.
- Errors inline below relevant field (`aria-describedby`, `aria-invalid`).
- Preserve valid field inputs after failure.
- Avoid clearing a profile on navigation.

### Status hierarchy
1. **Eligibility badge**: no identified blocker / verify / blocked.
2. **Numerical score**: profile alignment, 0–100, not employment probability.
3. **Explanation**: what matched and gaps, in text, not color alone.
4. **Warnings**: explicitly state unsupported or unknown legal matters.

### Loading / empty / errors
| Where | Loading | Empty / missing | Failure |
|---|---|---|---|
| Home | Usually static | N/A | Static CTA still accessible |
| Profile | 1 field skeleton per row | Empty form | Inline retry; no data loss |
| Recommendations | stats + 3 card skeletons | `Create Profile` or `No opportunities` | Retry recommendations |
| Details | header/body skeleton | Invalid ID → 404 | Retry server request |
| Saved | 2 card skeletons | No saved jobs + CTA | Retry fetch/removal |

### Toast rules
- Success after confirmed save/update/remove only.
- Error on failed mutation with actionable wording.
- Do not toast during every initial fetch or route change.

---

## 12. Semantic layouts and reusable visual patterns

### Profile section card
```text
┌─────────────────────────────────────────────────────────────┐
│ 01  Education                                              │
│     Help text about relevant qualifications                │
│                                                             │
│ Education level [Select]  Field of study [Input]            │
└─────────────────────────────────────────────────────────────┘
```

- Heading group first, then field grid (`grid-cols-1 md:grid-cols-2 gap-5`).
- Full-width rows for textarea / multi-value controls.
- Error red only at affected input.

### Recommendation card
```text
┌─────────────────────────────────────────────────────────────┐
│ Programme Assistant                              Match 86% │
│ Fictional NGO · Toronto, Canada                            │
│ [Requires verification]  [Full-time]                       │
│                                                             │
│ ✓ Excel, reporting, project coordination                   │
│ ! Work authorization requires verification                 │
│                                                             │
│ [View details]                           [Save opportunity] │
└─────────────────────────────────────────────────────────────┘
```

Important: **86% is illustrative**; computed results are not fixed. Cards must handle scores of 0%, 100%, and varied explanations without breaking.

### Detail score breakdown
- Label left, numeric `n / maximum` or percentage right.
- Track: muted background; fill: primary. Use semantic role + `aria-label` or visible adjacent numeric value.
- Provide explanation text below; bars alone are insufficient.
- If criterion data is unknown, show `Unknown` rather than a misleading full match.

### Warning banners
- Use soft warning background, border, icon (AlertTriangle), and heading plus body.
- No unverified affirmative visa language.
- Do not use giant red warning boxes for minor preference mismatches.

---

## 13. Iconography, imagery, and motion

- Use `lucide-react` throughout; uniform stroke, **no mixed icon packs**.
- Sidebar 18px, primary action icons 16–18px, empty states 24–32px.
- Never show a country flag as proof of authorization; country name is mandatory readable text.
- No need for remote images. Empty states can use icons/line art and copy.
- Hover: color/border changes in 120–180ms, no scale bounce or large shifts.
- Mobile drawer transition under 240ms via shadcn default animations if available.
- Match scores should **not** count up artificially: stability and transparency take priority.
- Respect `prefers-reduced-motion`; CSS companion handles global reduced-motion fallback.

---

## 14. Accessibility specification (WCAG-minded)

- Landmarks: `<header>`, `<nav aria-label="Primary">`, `<main id="main-content">`, `<footer>`.
- Skip link is first focusable element; CSS class `.app-skip-link` included.
- One H1 per screen, subsequent logical heading levels.
- All control target sizes at least 44px; maintain visible focus.
- No status encoded by color only: badges contain explicit text and icon optionally.
- Icons decorative when beside explicit text → `aria-hidden="true"`.
- Inputs: associated `<label htmlFor>`, `id`, `aria-invalid`, relevant error descriptions.
- Toasts should be polite announcements; avoid stealing focus.
- Drawer returns focus to trigger when closed.
- No `onClick` on noninteractive divs; use buttons/links.
- Confirm keyboard-only completion: menu → profile → save → recommendation → detail → shortlist.
- Minimum readable metadata 12px; no 10px critical text.

---

## 15. `globals.css` — deployment instructions and full-file contract

The standalone companion file **`globals.css` is the canonical complete implementation**. Do not reconstruct from snippets. It contains:

1. `@import "tailwindcss";` for Tailwind CSS v4.
2. Light-theme `:root` colors, functional status tokens, shadcn sidebar variables.
3. `@theme inline` exposing `bg-background`, `text-primary`, `bg-warning-soft`, etc.
4. Radius scale from `--radius`.
5. Next.js Inter variable mapping, global font and typography base.
6. `.app-container`, `.app-page`, `.app-card`, `.app-section`, `.app-prose`, `.app-focus`, `.app-skip-link`, `.app-scrollbar`.
7. Responsive changes at 768px and 1024px.
8. Reduced-motion handling.

**Required file location:** `src/app/globals.css`.  
**Required CSS loader:** Tailwind v4 PostCSS integration with `@tailwindcss/postcss`.  
**Required font:** `Inter` via `next/font/google` and `--font-inter` in `src/app/layout.tsx`.

### Install / configure
```bash
pnpm add -D tailwindcss @tailwindcss/postcss postcss
pnpm dlx shadcn@latest init
pnpm add lucide-react
```

`postcss.config.mjs`:
```js
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};
export default config;
```

**Shadcn setup caution:** Running `shadcn init` may replace or append CSS tokens. Initialize shadcn **first**, then use the supplied `globals.css` as final theme source, and verify required primitive tokens after adding components. If future installed shadcn components use extra tokens not in this guide, add them centrally and document them.

### Utility convention
```tsx
<section className="app-page">
  <div className="app-container">
    <h1 className="text-[26px] font-bold text-foreground md:text-3xl">
      Your Career Matches
    </h1>
    <div className="mt-6 grid grid-cols-2 gap-3 xl:grid-cols-4">
      {/* live statistic cards */}
    </div>
  </div>
</section>
```

### CSS ownership rules
- Global variables/layout helpers → `globals.css`.
- One screen's layout → Tailwind classes within that screen.
- Shared reusable visual pattern → reusable component with semantic classes.
- Third-party library style issue → wrapper/variant rather than random global override.
- Do not make new global `.button`, `.card2`, `.text-blue` utility classes.

---

## 16. Component implementation quality & examples

### Use shadcn primitive correctly
- Generated primitives in `src/components/ui/` are low-level; wrappers in domain folders own behavior.
- Never couple Supabase queries to a generic `Button` or `Card` primitive.
- `Button asChild` where supported: wrap a `Link` for navigation, never call `router.push` for plain anchor navigation without a reason.

```tsx
import Link from "next/link";
import { Button } from "@/components/ui/button";

<Button asChild>
  <Link href="/profile">Create My Career Profile</Link>
</Button>
```

### Match score progress
```tsx
export function MatchScoreBar({ score }: { score: number }) {
  const safeScore = Math.max(0, Math.min(100, Math.round(score)));
  return (
    <div aria-label={`Profile match: ${safeScore} out of 100`}>
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Profile match</span>
        <strong className="text-foreground">{safeScore}%</strong>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full bg-primary" style={{ width: `${safeScore}%` }} />
      </div>
    </div>
  );
}
```

**Exception:** The inline `style={{ width: ... }}` above is allowed for a **dynamic measurement**, not color. All actual colors still come from semantic tokens. Track and fill include the visible percentage in adjacent text.

### Data and design consistency
- Render server-derived score, never random `%` or `Math.random()`.
- Use backend eligibility enum without reinterpreting status from a score in UI.
- Persist shortlist before displaying success.
- Display `Requires verification` for missing work authorization information.
- Candidate does not need to see raw internal IDs or debugging payloads.

---

## 17. Page-by-page QA checklist

### Home
- [ ] Main CTA goes to `/profile`.
- [ ] How-it-works link scrolls to actual section.
- [ ] Fictional opportunities are clearly disclosed.
- [ ] Mobile hero and buttons are readable.

### Profile
- [ ] Form fields match PRD candidate profile.
- [ ] Validation errors accessible and in-view.
- [ ] Country/skill chips wrap.
- [ ] Languages add/remove work.
- [ ] Unknown eligibility remains selectable.
- [ ] Save persists; edit prepopulates; failed save does not navigate.

### Recommendations
- [ ] Actual counts, scores, ordered results.
- [ ] All three eligibility labels supported.
- [ ] Score and legal eligibility never conflated.
- [ ] Job card contains title, organization, country, strengths, gap, details, save.
- [ ] Absent profile / no opportunities / loading / error handled.

### Opportunity details
- [ ] Complete requirements presented.
- [ ] Match breakdown / warning displayed.
- [ ] Invalid route results in 404.
- [ ] No fake Apply Now or external employers.
- [ ] Save action stays in sync.

### Saved
- [ ] List mirrors persisted Supabase state.
- [ ] Save/remove works after refresh.
- [ ] Empty state routes back to Recommendations.
- [ ] Failed removal is not presented as success.

### Global
- [ ] Desktop sidebar at ≥1024, drawer below.
- [ ] No horizontal scroll at 320px.
- [ ] Keyboard navigation and focus visible.
- [ ] UI uses token colors only; no raw HEX inside TSX.
- [ ] No phantom nav or notification buttons.
- [ ] Reduced motion respected.
- [ ] Mock mode indicated only when enabled.

---

## 18. Non-negotiable implementation checklist for an AI coding assistant

1. **Read** assessment, PRD, screen-by-screen blueprint and this guide before building pages.
2. **Use only Next.js App Router + Supabase** as application/backend services; Tailwind/shadcn are UI libraries.
3. **Do not create `/login`, `/register`, `/dashboard`, `/admin` routes.** Supabase anonymous session is initialized when needed.
4. **Route groups may be used** as specified, but URLs stay exactly the same.
5. **Keep UI text truthful** (fictional records, candidate-declared authorization, no guarantee of employability).
6. **Do not change `globals.css` without design-system justification.** Add tokens once and reuse them.
7. **Component placement follows Section 9**. No all-in-one 1000-line page.
8. **Responsive and accessible from first implementation**, not retrofitted.
9. **No inert controls**, fake statistics, pseudo-saves, or undefined CTA paths.
10. **Build and test all five screens and states** before extra polish.
11. **Do not conflate match score with eligibility**; display them independently.
12. **Never expose privileged Supabase credentials** to client components.
13. **Test profile→recommendations→details→saved flow** at 375px and 1440px.
14. **Keep the 6–8 hour assessment scope in mind**; avoid aesthetic and architectural overengineering.

---

## 19. Implementation order

1. shadcn/Tailwind initialize → **install canonical `globals.css`** → font → App Shell.
2. Add `components/layout/`, tokens, sidebar/topbar/drawer, responsive main.
3. Build `src/components/profile/` and `/profile` state variants.
4. Build matching presentational components with test fixtures, then connect real computed results.
5. Build `/recommendations` and `/opportunities/[id]` with complete explanations.
6. Add shortlisting interactions and `/saved`.
7. Build minimal public home and finishing polish.
8. QA all breakpoints, semantics, status wording, skeleton/empty/error states, and documentation.

### Final design definition of done
A reviewer must be able to use the app on a small phone or desktop, understand the ranking, see important missing requirements, save and revisit a fictional opportunity, and complete all interactions with keyboard and screen reader cues—all without inconsistent visual tokens or dead UI controls.

---

## 20. Source and version notes

- The assessment defines **what** must work; it does **not** mandate design colors, sidebar, Tailwind version, screen count, or database schema.
- PRD and screen blueprint define **our chosen solution** and five-screen information architecture.
- This guide fixes **implementation-level visuals and component conventions** for that solution.
- Technology conventions are aligned to Tailwind's Next.js setup and shadcn's Tailwind v4 theme model:
  - https://tailwindcss.com/docs/installation/framework-guides/nextjs
  - https://ui.shadcn.com/docs/theming
  - https://ui.shadcn.com/docs/tailwind-v4

**End — Design System & Implementation Guide v1.0**
