# International Career Mobility Platform — Screen-by-Screen UX & Component Blueprint

**Version:** 1.0 · **Status:** Implementation-ready · **Target:** Next.js App Router + TypeScript + Supabase · **UI:** Tailwind CSS + shadcn/ui  
**Source of truth:** Career Mobility Platform Technical Assessment (7 pages) + agreed PRD v2.0.  
**Scope rule:** The assessment requires an end-to-end profile → evaluation → ranked recommendation → details → shortlist flow. It **does not require** email/password login, a separate dashboard, an employer portal, or admin management. This blueprint uses the agreed **Supabase Anonymous Auth** approach and a *dashboard-like application shell* without introducing extra primary routes.

---

## 1. Information architecture & routes

| ID | Page/screen | URL | Authentication | Purpose |
|---|---|---|---|---|
| S01 | Public home | `/` | Not required | Product explanation, start action |
| S02 | Candidate profile | `/profile` | Anonymous session | Create/edit candidate data |
| S03 | Recommendations (main workspace) | `/recommendations` | Anonymous session | Ranked results and their reasons |
| S04 | Opportunity details | `/opportunities/[id]` | Anonymous session for personal match; public job data otherwise | Inspect requirements, match breakdown, save |
| S05 | Saved opportunities | `/saved` | Anonymous session | Review/remove bookmarks |
| SYS01 | Application initialization | Within app shell, not a route | Supabase session bootstrap | Check/create anonymous session |
| SYS02 | Error / offline / empty / loading | Per page or component | Same as parent | Consistent non-success states |
| SYS03 | Not-found | `not-found.tsx` | Not required | Invalid opportunity route |

**No `/login`, `/register`, `/dashboard`, `/admin` pages.** The term *dashboard* in UI discussion refers to **S03 Recommendations**, the candidate's main workspace. The assessment permits authentication but does not require it; adding email/password forms would contradict our approved PRD, create unnecessary flows, and distract from matching.

### Route decision logic

```text
Open /
  ├─ Start / Create profile → /profile
  │    ├─ No Supabase session → create anonymous session
  │    ├─ Existing profile → prefill form
  │    └─ Save & View Matches → /recommendations
  ├─ Recommendations nav → /recommendations
  │    ├─ Profile missing → Profile Required state → /profile
  │    └─ Profile exists → evaluate all active opportunities
  ├─ Opportunity card → /opportunities/[id]
  │    └─ Save/Unsave → state persisted in Supabase
  └─ Saved nav → /saved
       └─ View details / Remove
```

In **mock mode**, anonymous Supabase initialization is skipped; a local demo identity and localStorage persistence are used. This is clearly labeled as a demo mode; never represent localStorage as secure account storage.

---

## 2. Global application shell

### 2.1 Desktop layout (≥1024px)

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│ Topbar:  Brand/Logo | Current page/breadcrumb | Demo indicator | Profile CTA│
├────────────────┬────────────────────────────────────────────────────────────┤
│ SIDEBAR        │ MAIN CONTENT                                               │
│                │                                                            │
│  Overview      │ Page heading + summary + page actions                       │
│  My Profile    │                                                            │
│  Recommendations│ Context-specific page content                              │
│  Saved Jobs    │                                                            │
│                │                                                            │
│  ───────────   │                                                            │
│  How Matching  │                                                            │
│  Works (anchor)│                                                            │
│  Demo Mode tag │                                                            │
└────────────────┴────────────────────────────────────────────────────────────┘
```

**Sidebar navigation** (all links real):

1. Overview → `/` (home)
2. My Profile → `/profile`
3. Recommendations → `/recommendations`
4. Saved Jobs → `/saved`
5. How Matching Works → `/` anchored to `#how-it-works` (optional help link; not a standalone page)

**Topbar components:**

- `BrandMark` text/icon logo; link to `/`.
- `PageBreadcrumb` (`Home / Recommendations`, `Recommendations / Opportunity Details`, etc.).
- `CurrentPageTitle` on compact variants where appropriate.
- `DemoModeBadge` **only when actually running in mock mode**; no false environment indicator.
- `ProfileEditButton` links to `/profile` when profile exists, otherwise `Create Profile`.
- **Do not show** fake notifications, messaging, employers, avatars/accounts, wallet, sign-in, or settings controls.

**Sidebar behavior:**

- Fixed/sticky in desktop layout; width **232–248px** (recommend 240px).
- Nav selected state based on pathname; `/opportunities/[id]` highlights Recommendations when navigated from there, or leave section neutral if no return context available.
- Saved count is optional and must be derived from actual persisted data, never hardcoded.
- Bottom region contains a succinct `Prototype / Fictional listings` note.

**Content container:** max-width **1200px**, horizontal padding desktop **32px**, tablet **24px**, mobile **16px**; page section gaps **24–32px**.

### 2.2 Mobile layout (<768px)

```text
┌──────────────────────────────┐
│ ☰  Logo       Page action    │
├──────────────────────────────┤
│ Page heading                 │
│ Context/summary              │
│                              │
│ Main content (single column) │
│                              │
└──────────────────────────────┘

☰ opens Sheet:
  Overview
  My Profile
  Recommendations
  Saved Jobs
  How Matching Works
```

- Desktop sidebar becomes a **shadcn Sheet** triggered by menu button.
- Drawer closes on navigation.
- Topbar never displays crowded desktop breadcrumbs.
- All content is one column unless small side-by-side controls still fit.
- Touch target minimum **44×44px**.

### 2.3 Tablet layout (768–1023px)

- Use compact topbar + drawer navigation instead of a narrow permanent sidebar.
- Content max-width remains constrained; cards may use 2 columns where readability permits.

### 2.4 Shared shell component tree

```text
AppLayout
├── Providers (only what is necessary)
├── AppShell
│   ├── DesktopSidebar
│   │   ├── BrandMark
│   │   ├── SidebarNavItem[]
│   │   └── SidebarFooter
│   ├── Topbar
│   │   ├── MobileMenuTrigger
│   │   ├── Breadcrumbs
│   │   ├── EnvironmentIndicator
│   │   └── ProfileAction
│   ├── MobileNavigationSheet
│   └── MainContent
│       ├── PageHeading (page-specific)
│       └── PageBody
└── Toast/Notifications (success or error feedback only)
```

**Do not add an unnecessary global state manager.** Use server-fetched data, local form state, and explicit mutation refreshes.

---

## 3. S01 — Public home (`/`)

### Goal

Explain what the product does and get users to create their profiles. Do not pretend the fictional opportunities are live jobs.

### Visual layout

```text
[Topbar / responsive nav]

[HERO]
  eyebrow: International Career Mobility
  H1: Discover International Career Opportunities That Match Your Profile
  supporting copy
  [Create My Career Profile]  [How It Works]
  right: clean visual summary / scoring illustration (optional)

[HOW IT WORKS] #how-it-works
  01 Create Your Profile
  02 Get Ranked Recommendations
  03 View Details & Save

[TRUST / SCOPE NOTE]
  Fictional opportunities • Transparent matching • Eligibility needs verification

[FOOTER]
```

### Components

| Component | Content / responsibility | Interaction |
|---|---|---|
| `HomeHero` | Heading, description, 2 CTAs | Primary → `/profile`; secondary → `#how-it-works` |
| `HowItWorksSection` | Three instructional cards | Informational |
| `FeatureStepCard` | Icon, step number, description | None |
| `PrototypeDisclosure` | Fictional demo disclaimer | None |
| `SiteFooter` | Product/version context | None |

### States

- No profile: primary button text `Create My Career Profile`.
- Profile exists: primary button text `View My Recommendations` → `/recommendations` (requires session/profile status; otherwise keep generic CTA).
- Avoid rendering misleading personalized state before profile has loaded.

### Done when

- Every link works, anchored explanation scrolls correctly, mobile layout has no overflow, and the fictional-data disclosure is visible.

---

## 4. SYS01 — Anonymous session initialization (no login screen)

### Goal

Give each demo user a Supabase Auth identity without creating a password-based login feature.

### Interaction sequence

1. User navigates to a profile-dependent operation.
2. `SessionBootstrap` reads the current Supabase user session.
3. If valid session exists, continue.
4. Otherwise call Supabase Anonymous Sign-In **once**; guard against concurrent duplicate requests.
5. If successful, proceed to profile/data load.
6. If unsuccessful, present `SessionInitializationError` with `Retry`.
7. In mock mode, bypass Supabase and use local demo persistence.

### Components

- `SessionBootstrap` — orchestration.
- `SessionLoadingState` — centered spinner/skeleton + `Preparing your workspace…`.
- `SessionInitializationError` — human-readable failure and retry button.

### Security

- Resolve user ownership from a **verified Supabase session**, not from a `candidateId` supplied by the browser.
- RLS protects candidate profile and shortlist tables.
- Never expose privileged Supabase key in client code.

### Not included

No email field, password field, reset-password link, SSO button, sign-up page, or logged-in user settings menu.

---

## 5. S02 — Candidate profile (`/profile`)

### Goal

Create and edit a profile containing every assessment-required matching attribute.

### Desktop visual layout

```text
[Page heading: Your Career Profile]
[Supporting copy: Used to explain match scores]

┌───────────────────────────────────────┬──────────────────────────┐
│ MAIN FORM (≈ 2/3)                     │ SIDE PANEL (≈ 1/3)       │
│                                       │                          │
│ 01 Education                          │ Profile completion       │
│   Education level [Select]            │ What we evaluate:        │
│   Field of study [Input]              │ • Skills                 │
│                                       │ • Experience             │
│ 02 Professional Experience            │ • Education              │
│   Years [Number input]                │ • Location               │
│   Experience summary [Textarea]       │ • Language               │
│                                       │ • Eligibility            │
│ 03 Skills                             │                          │
│   [Skill chips] [+ Add skill]         │ Reminder: visa/work      │
│                                       │ authorization unknown ≠  │
│ 04 Languages                          │ confirmed eligible       │
│   [Language][Proficiency][Remove]     │                          │
│   [+ Add language]                    │                          │
│                                       │                          │
│ 05 Career Preferences                 │                          │
│   Countries [multi-select]            │                          │
│   Career interests [multi-select]     │                          │
│                                       │                          │
│ 06 Eligibility                        │                          │
│   Work authorization by country       │                          │
│   Student status [Yes/No/Unknown]     │                          │
│                                       │                          │
│ [Save Profile] [Save & View Matches]   │                          │
└───────────────────────────────────────┴──────────────────────────┘
```

On mobile, the side panel goes below the form or becomes a compact informational disclosure above actions. Buttons are full-width or stacked.

### Form sections & fields

| Section | Field | UI | Validation / notes |
|---|---|---|---|
| Education | `educationLevel` | Select | Required; high school/diploma/bachelors/masters/doctorate |
| Education | `fieldOfStudy` | Input | Required nonempty trimmed string |
| Experience | `experienceYears` | Number input | Required, ≥0; allow 0.5 increments or decimal |
| Experience | `experienceDescription` | Textarea | Required trimmed text |
| Skills | `skills[]` | Tag input/chips | ≥1, trim/dedupe/canonicalize; remove chip button |
| Languages | `languages[]` | Repeatable pair rows | ≥1; each language + proficiency; unique per language |
| Preferences | `preferredCountries[]` | Multi-select | ≥1; Germany, Canada, Singapore available |
| Preferences | `careerInterests[]` | Multi-select/chips | ≥1; e.g. programme support, operations, coordination |
| Eligibility | `workAuthorizations` | Per-country Yes/No/Unknown | Default `unknown`; never default Yes |
| Eligibility | `studentStatus` | Segmented/select | `yes`, `no`, `unknown`; default unknown |

**Proficiency scale:** basic, intermediate, professional, fluent, native.

### Core components

```text
ProfilePage
├── PageHeading
├── ProfileForm
│   ├── EducationSection
│   │   ├── EducationLevelSelect
│   │   └── FieldOfStudyInput
│   ├── ExperienceSection
│   │   ├── ExperienceYearsInput
│   │   └── ExperienceSummaryTextarea
│   ├── SkillsSection
│   │   └── SkillsTagInput
│   ├── LanguagesSection
│   │   └── LanguageRow[] (LanguageSelect, ProficiencySelect, RemoveButton)
│   ├── PreferencesSection
│   │   ├── CountryMultiSelect
│   │   └── CareerInterestMultiSelect
│   ├── EligibilitySection
│   │   ├── CountryAuthorizationRow[]
│   │   └── StudentStatusSelect
│   └── ProfileFormActions
│       ├── SaveProfileButton
│       └── SaveAndMatchButton
└── ProfileGuidanceCard
```

### Detailed interactions

- Adding a skill: trim input; match configured aliases; prevent duplicate; show chip.
- Removing a skill: delete chip and update form validation.
- Adding a language: append row; prevent duplicate language; require proficiency.
- Changing preferred countries: display authorization status control for each newly selected country; if no saved status, set **Unknown**.
- Removing a preferred country: do **not** silently assert a new authorization status; retain stored country-specific data or prune it only with a clearly documented policy (recommended: retain data for future reuse).
- Clicking `Save Profile`: Zod validates client-side for immediate feedback and server-side for security; upsert profile; show success.
- Clicking `Save & View Matches`: save first; navigate to `/recommendations` only when persistence succeeds.
- Existing profile: form initializes with saved values, including unknown statuses.
- Provide a `Load Sample Candidate` secondary action **for demonstration only**, with a clear confirmation before overwriting a nonempty form.

### State matrix

| State | UI behavior |
|---|---|
| Loading profile | Skeleton fields, disable submit |
| Empty/new | Default blank required inputs; authorization unknown |
| Editing | Prefilled form |
| Invalid | Inline error, focus first invalid field |
| Saving | Disable primary actions, show progress label |
| Saved | Success toast and remain or navigate per action |
| Failed save | Error toast/callout, preserve local form edits, Retry |
| Session unavailable | Session retry UI, not silent reset |

### Acceptance criteria

A candidate can create, persist, reopen and update every matching field; validation prevents negative experience/empty skills; nothing inferred about eligibility is shown as verified.

---

## 6. S03 — Recommendations workspace (`/recommendations`)

### Goal

Show ranked opportunities with transparent score and eligibility status. **This is the app's dashboard-style main screen.**

### Desktop visual layout

```text
[Topbar / Sidebar]
[Heading: Your Career Matches]                   [Edit Profile]
[Subtitle: Ranked using your saved profile]

[PROFILE SUMMARY]
  Degree  •  2 years experience  •  5 skills  •  3 preferred countries

[SUMMARY METRICS: four compact cards]
  Total Evaluated | No Identified Blocker | Verify Requirements | Blocked

[EXPLANATION BAR]
  Matching score measures alignment; eligibility status is separate.

[RESULTS TOOLBAR]
  Ranked by eligibility + score | 15 results

[LIST - one prominent card per row or 2 columns at large width]
┌────────────────────────────────────────────────────────────────────┐
│ Programme Assistant                 Match Score: 86/100           │
│ Fictional NGO · Toronto, Canada     [Requires Verification]      │
│ [Full-time] [Programme Support]                                  │
│ ✓ Excel  ✓ Reporting  ✓ Coordination                              │
│ ! Work authorization not verified                                 │
│ [View Details]                          [Bookmark Save/Unsave]    │
└────────────────────────────────────────────────────────────────────┘
[... all 15 active jobs, including weak/blocked matches ...]
```

**Counts:** `Total Evaluated` should equal the number of active validated opportunities actually evaluated. Category counts must sum to that total.

### Core components

```text
RecommendationsPage
├── PageHeading + EditProfileButton
├── CandidateSummaryCard
│   ├── EducationSummary
│   ├── ExperienceSummary
│   ├── SkillSummary
│   └── PreferredCountrySummary
├── RecommendationStats
│   └── MetricCard[]
├── ScoreEligibilityExplainer
├── ResultsToolbar
└── RecommendationList
    └── RecommendationCard[]
        ├── OpportunityIdentity (title, company, location, employment type)
        ├── MatchScoreIndicator
        ├── EligibilityStatusBadge
        ├── MatchedCriteriaPreview
        ├── PrimaryGapPreview
        └── RecommendationActions
            ├── ViewDetailsLink
            └── SaveOpportunityButton
```

### Matching and ranking contract

- Only **server-computed** score/explanations; never calculate independently in UI.
- Display match score as integer `0–100`.
- Eligibility groups ordered: `no_identified_blocker`, `requires_verification`, `blocked`; within group sort descending score, stable ID tie-break.
- Explain that a higher-score blocked opportunity can appear below a lower-score opportunity with no identified blocker.
- The badge **“No identified blocker”** does not mean visa/legal eligibility is certified.
- Every card has at least one grounded matching observation and explicit gap/verification message when applicable.
- Show weak and blocked opportunities instead of hiding them.
- **No fake “Apply now” buttons**: application submission is out of scope.

### User interactions

| Action | Expected behavior |
|---|---|
| `Edit Profile` | Navigate `/profile`, preserve profile |
| `View Details` | Navigate `/opportunities/[id]` |
| Save/Unsave | Call shortlist persistence, update icon/state after confirmation |
| Retry failed match | Re-request profile/opportunities and recompute |
| Browser refresh | Rebuild results from current profile + dataset, not stale stored scores |

### States

- `profile_missing` → focused empty state: `Create your profile to see career matches`, CTA `/profile`.
- `loading` → summary/card skeletons, no fabricated percentages.
- `success` → cards sorted and explained.
- `zero_opportunities` → no results message.
- `match_error` → explicit error + retry.
- `partial_invalid_seed` → invalid records must be excluded with server logging; do not silently claim total includes them.

### Mobile

- Metrics: 2×2 grid if feasible, otherwise stacked.
- Cards: one per row; score and badge appear near the title.
- Actions remain reachable without sideways scrolling.

### Acceptance criteria

All valid active jobs are assessed and ranked; score explanations match actual calculations; eligibility uncertainty is never hidden; cards link to details and support reliable save state.

---

## 7. S04 — Opportunity details (`/opportunities/[id]`)

### Goal

Give a full structured view of a fictional position and its fit for the current candidate.

### Desktop visual layout

```text
[Back to Recommendations]

┌────────────────────────────────────────────┬───────────────────────────┐
│ PRIMARY CONTENT                            │ STICKY MATCH SIDE PANEL   │
│                                            │                           │
│ [Title]                                    │ 86 / 100 Match Score      │
│ [Fictional Organization]                   │ [Requires Verification]   │
│ [City, Country] [Employment Type]           │                           │
│                                            │ Skills: 26.25 / 35       │
│ ABOUT THE ROLE                             │ Experience: 20 / 20      │
│ Full description                           │ Education: 15 / 15       │
│                                            │ Location: 15 / 15        │
│ RESPONSIBILITIES                           │ Language: 15 / 15        │
│ Bullets                                    │ (Illustrative only)       │
│                                            │                           │
│ ROLE REQUIREMENTS                          │ Your strengths           │
│ Skills, education, experience, languages   │ Your gaps                │
│                                            │ Work status warning      │
│ ELIGIBILITY CONDITIONS                     │                           │
│ Explicit requirements and unknowns         │ [Save Opportunity]        │
└────────────────────────────────────────────┴───────────────────────────┘
```

All scores on the actual page must be computed, not copied from the illustration above.

### Core components

- `BackToRecommendationsLink`
- `OpportunityOverview`
- `OpportunityMetadata`
- `OpportunityDescription`
- `OpportunityResponsibilities`
- `OpportunityRequirements`
- `EligibilityRequirements`
- `MatchSidebar`
  - `OverallMatchScore`
  - `EligibilityStatusBadge`
  - `CriterionScoreList`
  - `MatchedStrengthsList`
  - `MissingRequirementsList`
  - `VerificationWarnings`
  - `SaveOpportunityButton`
- `NoProfileMatchPrompt` for users without a saved profile.

### Detail data rules

- Job fields are read from the selected Supabase opportunity.
- Personal match is calculated using the current candidate profile and this opportunity; **do not reuse stale score data**.
- If no profile exists, still show permitted job details, but explain `Create a profile to view your match` instead of a score.
- If opportunity ID is invalid, return `notFound()`.
- Inactive jobs must not show actionable recommendation status. If reached through saved history, show unavailable state.

### Mobile layout

1. Back link and opportunity header.
2. Compact score/eligibility summary.
3. Job description and requirements.
4. Match explanation.
5. Save action (inline at end; sticky mobile action optional only if it does not obscure content).

### Acceptance criteria

Detail shows all structured requirements, accurate score breakdown and gaps, appropriate unknown status, working Save/Unsave and Back navigation.

---

## 8. S05 — Saved opportunities (`/saved`)

### Goal

List only jobs bookmarked by the current anonymous user and allow removal.

### Visual layout

```text
[Heading: Saved Opportunities]         [Explore Recommendations]
[Description: Jobs you've shortlisted for later]
[Saved total: N]

┌──────────────────────────────────────────────────────────────┐
│ [Role] · [Fictional Org] · [Location]                        │
│ [Current Match Score] [Current Eligibility Status]           │
│ [View Details]                            [Remove Saved]     │
└──────────────────────────────────────────────────────────────┘

[Empty state if N = 0]
  Bookmark icon
  No Saved Opportunities Yet
  Explore your recommendations and save jobs to revisit.
  [Explore Recommendations]
```

### Components

- `SavedPageHeader`
- `SavedCount`
- `SavedOpportunityList`
- `SavedOpportunityCard`
- `CurrentMatchSummary`
- `ViewOpportunityLink`
- `RemoveSavedButton`
- `SavedEmptyState`

### Interactions

- Remove requires an actual Supabase delete (or mock persistence update).
- Only update confirmed saved state after successful delete; if optimistic UI is used, rollback on failure.
- Revisit details via `/opportunities/[id]`.
- Profile edits affect *displayed current scores* on the shortlist page.
- Do not duplicate records when saving the same opportunity again.

### States

Loading, populated, empty, remove-in-progress, remove-failed, unauthorized/invalid session, stale/inactive opportunity.

### Acceptance criteria

Shortlist survives refresh, data is isolated by authenticated user, removing a saved opportunity works, and displayed match is current.

---

## 9. Required shared feedback and edge-case screens

| System screen/state | Trigger | UI | Action |
|---|---|---|---|
| Loading app/session | Anonymous session startup | Spinner + explanatory text | None until resolved |
| Form validation error | Required/malformed input | Inline field message | Correct input |
| Profile save error | Failed database upsert | Alert/toast; edits retained | Retry |
| Profile required | Recommendations before profile | Empty card with explanation | Create Profile |
| No opportunities | Empty active dataset | Empty card | Retry or return Home |
| Matching failure | Server exception | Error callout | Retry |
| Unknown work authorization | Candidate country status unknown | Warning in result and details | Update Profile / verify externally |
| Hard requirement blocked | Mandatory criterion fails | `Blocked` badge + exact reason | Inspect Requirements |
| Shortlist empty | No saved records | Empty card | Explore Recommendations |
| Save/remove failure | Database mutation failed | Error toast + unchanged/rolled back icon | Retry |
| Opportunity not found | Invalid ID | `not-found.tsx` | Back to Recommendations |
| Supabase unavailable | Remote backend failure | Service error and retry; **no silent switching to mock mode** | Retry / run documented mock build |

**Accessibility:** Alerts use correct ARIA semantics; informative messages remain readable without relying on badge color.

---

## 10. Screen-to-screen navigation matrix

| From | Trigger | To | Conditions |
|---|---|---|---|
| Home | Create My Career Profile | Profile | Initialize anon session |
| Home | How It Works | Home `#how-it-works` | Scroll anchor |
| Sidebar/Drawer | My Profile | Profile | Same session |
| Profile | Save Profile | Profile | Persistence succeeds |
| Profile | Save & View Matches | Recommendations | Valid profile saved |
| Recommendations | Edit Profile | Profile | Existing values prefilled |
| Recommendations | View Details | Opportunity Details | Opportunity exists |
| Recommendations | Save | Same page | Persist shortlist record |
| Opportunity Details | Back | Recommendations | Preserve current profile |
| Opportunity Details | Save/Unsave | Same page | Persist mutation |
| Sidebar/Drawer | Saved Jobs | Saved | Same session |
| Saved | View Details | Opportunity Details | Opportunity accessible |
| Saved | Remove | Saved | Persist mutation |
| Saved | Explore Recommendations | Recommendations | Profile available; otherwise show profile-required |

**Navigation invariant:** No required primary action may lead to a dead-end screen.

---

## 11. Component inventory and reusable prop contracts

| Component | Reusable props | Notes |
|---|---|---|
| `AppShell` | `children` | Sidebar/topbar and content container |
| `SidebarNavItem` | `label`, `href`, `icon`, `active`, `count?` | Real URL only |
| `PageHeading` | `title`, `description?`, `actions?` | Consistent heading scale |
| `StatusBadge` | `status`, `label?` | Neutral/warning/blocker; never color only |
| `ProfileFormSection` | `title`, `description?`, `children` | Identical section spacing |
| `SkillsTagInput` | `value`, `onChange`, `disabled?`, `error?` | Dedupe/normalize |
| `LanguageRow` | `value`, `onChange`, `onRemove` | Required language + proficiency |
| `CountryAuthorizationRow` | `country`, `value`, `onChange` | Unknown is default |
| `OpportunityCard` | `opportunity`, `match`, `isSaved`, `onSaveToggle`, `isBusy` | Recommendation context |
| `MatchScoreIndicator` | `score`, `size?` | Numeric score 0–100 |
| `CriterionScoreList` | `criteria` | Use calculated criterion scores |
| `EligibilityStatusBadge` | `status`, `warnings` | Display caveats |
| `MatchStrengthsList` | `items[]` | Derived, not AI hallucinated |
| `MatchGapsList` | `items[]` | Missing requirements |
| `SaveOpportunityButton` | `opportunityId`, `isSaved`, `busy`, `onToggle` | Handles async mutation safely |
| `ErrorState` | `title`, `description`, `onRetry?` | Page/module fallback |
| `EmptyState` | `icon`, `title`, `description`, `action?` | No results/saves/profile |

Prefer props carrying **plain typed data**, not components that query Supabase independently in every card. Fetch once per page and pass data down.

---

## 12. Data & API contract per screen

| Screen | Reads | Writes | Endpoint / mechanism |
|---|---|---|---|
| Home | Optional current profile state | None | Auth/session helper |
| Profile | Own profile | Upsert own profile | `GET /api/profile`, `PUT /api/profile` |
| Recommendations | Own profile + active opportunities + saved IDs | Save/unsave | `POST /api/match`, `GET/POST/DELETE /api/saved` |
| Opportunity Details | Opportunity + own profile/current match + save state | Save/unsave | `GET /api/opportunities/[id]`, match calculation, saved operations |
| Saved | Own saved records + opportunity details + current match | Remove | `GET /api/saved`, `DELETE /api/saved/[id]` |

### API conventions

- Server gets user identity from verified Supabase Auth session.
- All writes are validated again server-side.
- Expose no Supabase secret/service-role credentials to browser.
- For matches, use one batch fetch of opportunities per evaluation; not one API request per card.
- Scores are **not** persisted; recompute from current profile and dataset.
- Form and matching use the same domain definitions in Supabase and mock mode.

---

## 13. Design tokens & responsive rules

| Token | Value |
|---|---|
| Primary | `#2563EB` |
| Page background | `#F8FAFC` |
| Surface | `#FFFFFF` |
| Primary text | `#0F172A` |
| Secondary text | `#64748B` |
| Border | `#E2E8F0` |
| Success | `#10B981` |
| Warning | `#F59E0B` |
| Error | `#EF4444` |
| Font | Inter |
| Sidebar width | 240px |
| Desktop content max width | 1200px |
| Page horizontal padding | 16px mobile / 24px tablet / 32px desktop |
| Major page vertical gap | 24–32px |
| Card radius | 12px |
| Button/field radius | 8px |
| Card padding | 16px mobile / 24px desktop |
| Minimum tap target | 44px |
| Breakpoints | Mobile 320–767, tablet 768–1023, desktop ≥1024 |

Use semantic Tailwind/theme tokens in component source, rather than repeatedly embedding HEX values. Maintain a consistent type scale: hero 32/48, page heading 26/32, section 21/24, body 15/16 px (mobile/desktop).

### Responsive page matrix

| Page | Desktop | Tablet | Mobile |
|---|---|---|---|
| Home | Hero split layout optional | Stacked or split if fits | Stacked CTA full-width |
| Profile | 2-column form + guidance | Single column recommended | Single column, stacked controls |
| Recommendations | Metrics row + card list | 2×2 metrics | Stacked cards, 2×2 or stacked stats |
| Details | Main content + sticky match sidebar | Main + compact summary | Single column, no sticky obstruction |
| Saved | Wide list/cards | 1–2 columns | Single column |

---

## 14. Suggested implementation folders (App Router)

```text
src/
├── app/
│   ├── layout.tsx
│   ├── globals.css
│   ├── page.tsx                         # S01 Home
│   ├── loading.tsx
│   ├── error.tsx
│   ├── not-found.tsx
│   ├── profile/
│   │   ├── page.tsx                     # S02 Profile
│   │   └── loading.tsx
│   ├── recommendations/
│   │   ├── page.tsx                     # S03 Recommendations
│   │   └── loading.tsx
│   ├── opportunities/[id]/page.tsx     # S04 Details
│   ├── saved/page.tsx                   # S05 Saved
│   └── api/
│       ├── profile/route.ts
│       ├── opportunities/route.ts
│       ├── opportunities/[id]/route.ts
│       ├── match/route.ts
│       ├── saved/route.ts
│       └── saved/[id]/route.ts
├── components/
│   ├── layout/                          # AppShell, Topbar, Sidebar, MobileSheet
│   ├── profile/                         # Form sections, inputs
│   ├── opportunities/                   # Cards, detail blocks
│   ├── matching/                        # Score, reasons, gaps, eligibility
│   ├── shortlist/                       # Save button, saved cards
│   ├── feedback/                        # Skeleton, empty/error states
│   └── ui/                              # shadcn primitives
├── features/
│   ├── candidate/                       # Profile rules/services
│   ├── matching/                        # Pure TS scoring/eligibility/reasons/ranking
│   ├── opportunities/                   # Domain mapper
│   └── shortlist/                       # Save/remove actions
├── lib/
│   ├── supabase/                        # browser/server clients
│   ├── repositories/                    # DB access; mock adapter as needed
│   ├── validation/                      # Zod schemas
│   ├── auth/                            # Anonymous session bootstrap
│   └── mock/                            # localStorage and seeded JSON adapter
├── data/
│   ├── opportunities.json               # 15 fictional jobs
│   └── sample-profile.json              # Assessment test profile
└── types/                               # candidate, opportunity, matching, API
```

**Boundary rule:** Screens/components display information; repositories fetch/store information; the matching engine computes scores and factual explanations; no component may invent or recalculate match percentages.

---

## 15. User-flow acceptance tests (manual walkthrough)

| ID | Steps | Expected |
|---|---|---|
| U01 | Open home → Create Profile | Profile opens, session initialized |
| U02 | Submit empty profile | Field errors, no database write |
| U03 | Load fictional assessment profile → Save | Persists correctly |
| U04 | Click Save & View Matches | Ranked list of 15 valid active jobs |
| U05 | Inspect strong match | Matched criteria and score grounded |
| U06 | Inspect partial match | Missing requirement(s) explained |
| U07 | Inspect German-speaking role | Missing mandatory German shown as blocker if profile definitively lacks it |
| U08 | Inspect student-only internship with unknown enrollment | Requires verification, no presumed enrollment |
| U09 | Inspect local authorization-required job with unknown authorization | Requires verification, never confirmed eligible |
| U10 | Open details | Full job requirements + current match |
| U11 | Save job → refresh → Saved | Item persists once |
| U12 | Remove saved job → refresh | Item absent |
| U13 | Edit candidate skills/experience → Recommendations | Score changes as specified by algorithm |
| U14 | Invalid opportunity URL | Not-found with way back |
| U15 | Network failure while saving | Error shown, original state retained/rolled back |
| U16 | Narrow mobile viewport (320px) | Navigation drawer and form/cards function without overflow |
| U17 | Supabase not configured, explicit mock mode | End-to-end workflow runs with local data and same engine |

Also include three formal assessment test evidences: strong match, partial match, critical gap.

---

## 16. Delivery order, implementation dependencies

1. **Data models + Zod validation + 15 seed jobs** — all later screens depend on reliable source fields.
2. **Supabase migrations, RLS, anonymous session** — secure persistence and ownership.
3. **Matching engine + tests** — skills, experience, education, location, language, eligibility, explanation, stable ranking.
4. **App shell + mobile navigation** — navigation foundation.
5. **S02 Profile** — candidate data input and persistence.
6. **S03 Recommendations** — core assessment outcome.
7. **S04 Details** — required deeper requirements view.
8. **S05 Saved** — working persistent shortlist.
9. **S01 Home polish** — minimal, not more important than core flow.
10. **Mock mode + responsive QA + README + technical note + test evidence + AI disclosure**.

### Final screen-level definition of done

- Every listed URL renders meaningful content.
- All shown controls perform real actions; no decorative dead buttons.
- No login/password feature appears because the agreed solution uses anonymous auth.
- The candidate profile is editable and persists in Supabase mode.
- All 15 fictional opportunities are evaluable; results include score, strengths, gaps and eligibility.
- Every job card has functioning detail and save interactions.
- The shortlist persists and can be modified.
- No unknown visa/work authorization is represented as verified.
- Desktop, tablet, and 320px mobile widths remain usable.
- Loading, validation, error, empty and not-found states exist where relevant.
- The prototype can be demonstrated and defended using the original assessment criteria.

---

## 17. Scope reconciliation: requested example vs project requirements

The question mentioned **“login page with email and password, then dashboard with sidebar and topbar”** as an example of the level of screen detail desired. The already-approved assessment PRD explicitly chooses **Supabase Anonymous Auth** and excludes email/password registration/login. Therefore this blueprint provides an equally detailed **session initialization** flow without creating an unrequested password screen, and defines the **Recommendations page as the main dashboard-style workspace**.

If email/password authentication is deliberately approved as a later change, that would require a PRD revision, new routes, auth validation, password reset, recovery/access rules, and additional tests. It is **not** part of this implementation baseline.

**END — Screen-by-Screen UX & Component Blueprint v1.0**
