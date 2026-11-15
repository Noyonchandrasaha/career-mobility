# PRODUCT REQUIREMENTS DOCUMENT
# International Career Mobility Platform

**Project:** AI-powered International Career Mobility Platform  
**Document Version:** 2.0 — Final Implementation Specification  
**Project Type:** Full-Stack Developer Technical Assessment  
**Status:** Approved Development Baseline  
**Scope:** Functional MVP Prototype  
**Primary Framework:** Next.js App Router  
**Database & Authentication:** Supabase  
**Language:** TypeScript

---

# 1. PROJECT OVERVIEW

## 1.1 Product Description

The International Career Mobility Platform is a web application that helps students and professionals identify international career opportunities based on their qualifications, skills, experience, languages, location preferences, and career interests.

The system evaluates a candidate profile against a predefined collection of fictional job and internship opportunities, calculates explainable matching scores, identifies important gaps or eligibility concerns, and presents ranked recommendations.

Candidates can inspect opportunity requirements and save opportunities to a shortlist.

The product must demonstrate one complete, functional workflow:

**Create Profile → Evaluate Opportunities → Generate Ranked Matches → Explain Results → View Opportunity → Save Opportunity**

The assessment evaluates implementation quality, technical judgment, product thinking, explainability, reliability, and the ability to defend architectural decisions.

## 1.2 Project Objective

Develop a focused, reliable, responsive working prototype that satisfies the original technical assessment.

The prototype is not intended to become a complete international recruitment platform.

Success is measured by functional correctness, transparent matching, reliable data handling, and clear technical documentation.

## 1.3 Project Constraints

| Constraint | Specification |
|---|---|
| Framework | Next.js App Router |
| Language | TypeScript |
| Backend | Next.js server-side code only |
| Database | Supabase PostgreSQL |
| Authentication | Supabase Anonymous Authentication |
| Styling | Tailwind CSS and shadcn/ui |
| Opportunity Source | Fictional Seed Dataset |
| Matching | Deterministic Rule-Based Engine |
| External AI API | Not used |
| External Job API | Not used |
| Separate Backend | Not allowed |
| Payment System | Not required |
| Production Web Scraping | Not required |
| Recommended Effort | Approximately 6–8 hours |
| Submission Window | Within 72 hours of receiving the assessment, unless otherwise agreed |

Next.js Route Handlers and Server Components will serve as the backend application layer.

Supabase is the only external application service.

---

# 2. PRODUCT GOALS

## 2.1 Primary Goals

**G-01 — Profile Management**

Allow candidates to create and edit a structured career profile.

**G-02 — Opportunity Discovery**

Display realistic, structured fictional opportunities across multiple countries and career categories.

**G-03 — Personalized Matching**

Compare candidate qualifications with each opportunity using repeatable scoring rules.

**G-04 — Explainable Recommendations**

Clearly explain matching strengths, missing requirements, and eligibility concerns.

**G-05 — Career Exploration**

Allow users to open an opportunity and examine its complete requirements.

**G-06 — Shortlisting**

Allow users to save and remove opportunities with persistent state.

**G-07 — Technical Demonstration**

Provide a reliable, runnable system with documented architecture and testing evidence.

## 2.2 Non-Goals

The MVP will not implement:

- Traditional email/password registration.
- Social login.
- Employer accounts.
- Administrative dashboards.
- Job application submission.
- Resume or CV parsing.
- Resume uploads.
- Live job scraping.
- Job aggregation services.
- AI chatbots.
- External LLM inference.
- Immigration advice.
- Visa application processing.
- Payments.
- Email notifications.
- Real-time messaging.
- Personalized job alert subscriptions.

Do not expand the application into these areas during the assessment.

---

# 3. USER PERSONA

## 3.1 Primary User — International Career Seeker

A student or working professional who wants to understand which international jobs align with their background.

### User Needs

The candidate needs to:

1. Describe their professional background.
2. Discover opportunities in preferred countries.
3. Understand whether their skills are relevant.
4. Identify missing qualifications.
5. Recognize language and work eligibility requirements.
6. Compare opportunities.
7. Save interesting opportunities.

## 3.2 User Permissions

The candidate may:

- Create or edit their own profile.
- View active opportunities.
- Receive recommendations based on their own profile.
- View opportunity details.
- Create and remove their own shortlist entries.

Candidates must not modify another candidate's information.

## 3.3 Authentication Approach

Use **Supabase Anonymous Authentication**.

The application will automatically create an anonymous Supabase user session when a visitor begins using profile-dependent features.

This avoids implementing an unnecessary login form while providing an authenticated user identifier for Row Level Security.

The anonymous user identifier is obtained from Supabase Auth, never generated and trusted solely from arbitrary browser input.

**Important limitations:**

- Anonymous sessions may not survive browser-data deletion.
- The prototype does not support account recovery.
- Anonymous identity is not suitable for long-term career profile management without an upgrade path.
- The UI must not claim the candidate has a permanent account.

---

# 4. CORE USER JOURNEY

## 4.1 Primary Workflow

### Step 1 — Application Entry

Candidate visits the homepage.

The application presents:

- Product purpose.
- A short explanation of profile matching.
- A primary action to create a career profile.

### Step 2 — Profile Creation

Candidate completes the profile form.

Fields cover:

- Education.
- Skills.
- Experience.
- Languages.
- Preferred locations.
- Career interests.
- Work authorization information.

### Step 3 — Profile Validation

The application validates all submitted inputs.

Invalid inputs produce field-level error messages.

### Step 4 — Save Candidate Profile

The system saves the profile in Supabase.

A candidate can reopen and edit the same profile.

### Step 5 — Retrieve Opportunities

The system fetches active fictional opportunities from Supabase.

### Step 6 — Matching Evaluation

The server-side matching engine compares the profile against each opportunity.

### Step 7 — Ranking

The system assigns:

- A numerical matching score.
- Criterion-level score breakdown.
- Matched requirements.
- Missing requirements.
- Eligibility status.
- Explanation.

### Step 8 — Recommendations

The candidate sees ranked job cards.

### Step 9 — Opportunity Details

The candidate opens a selected opportunity and reviews its requirements.

### Step 10 — Shortlist

The candidate saves an opportunity.

The saved opportunity appears on the shortlist page.

### Step 11 — Profile Revision

The candidate can return to the profile, change information, save, and view recalculated recommendations.

---

# 5. PAGE AND ROUTING SPECIFICATION

The application has exactly five primary pages.

| Page | Route | Purpose |
|---|---|---|
| Home | `/` | Introduce the product |
| Profile | `/profile` | Create and edit candidate profile |
| Recommendations | `/recommendations` | Display ranked matches |
| Opportunity Details | `/opportunities/[id]` | Show full job requirements |
| Saved Opportunities | `/saved` | Manage shortlisted jobs |

No separate login page or admin interface is required.

## 5.1 Home Page

**Route:** `/`

### Required Sections

**Header**

- Product name/logo.
- Home navigation.
- Profile navigation.
- Recommendations navigation.
- Saved navigation.

**Hero**

Primary heading:

"Discover International Career Opportunities That Match Your Profile"

Description:

"Explore global career opportunities, understand your matching strengths, and identify the requirements you may need to meet."

Primary button:

"Create My Career Profile"

Secondary button:

"Explore Opportunities"

The secondary button may lead to recommendations for users with saved profiles and the profile page otherwise.

**How It Works**

Three steps:

1. Create Your Profile.
2. Get Personalized Matches.
3. Explore & Save Opportunities.

**Footer**

- Product name.
- Assessment prototype notice.
- Current year.

### Acceptance Criteria

- Navigation works.
- Primary CTA opens the profile page.
- Layout is responsive.
- No false claims about live job availability.

---

## 5.2 Candidate Profile Page

**Route:** `/profile`

### Required Sections

**Page Header**

- Title: "Your Career Profile"
- Description explaining how matching uses candidate information.

**Education**

- Education level.
- Field of study.

**Professional Experience**

- Total years of experience.
- Experience description.

**Skills**

- Multiple skill selection.
- Add and remove skills.
- Clear selected skill display.

**Languages**

- Language selection.
- Proficiency selection.
- Add/remove languages.

**Career Preferences**

- Preferred countries.
- Career interests.

**Eligibility Information**

- Work authorization status for relevant countries.
- Current student enrollment status.

**Actions**

- Save Profile.
- Save & View Matches.

### Form Behavior

- Existing data must prepopulate when editing.
- Invalid fields show clear messages.
- A loading state appears while saving.
- Repeated submissions are prevented during an active save.
- Successful save produces confirmation.
- Save & View Matches navigates only after successful persistence.

### Required Profile Validation

| Field | Rule |
|---|---|
| Education Level | Required |
| Field of Study | Required, trimmed text |
| Experience Years | Required, number ≥ 0 |
| Experience Description | Required |
| Skills | At least 1 |
| Languages | At least 1 |
| Preferred Countries | At least 1 |
| Career Interests | At least 1 |
| Work Authorization | May be unknown |
| Student Status | Yes / No / Unknown |

---

## 5.3 Recommendations Page

**Route:** `/recommendations`

### Page Structure

**Header**

- Page title.
- Brief introduction.
- Edit Profile action.

**Candidate Summary**

Display:

- Education.
- Experience.
- Key skills.
- Preferred countries.

**Results Summary**

Display:

- Total evaluated opportunities.
- Opportunities with no identified configured blocker.
- Opportunities requiring verification.
- Opportunities with confirmed constraint gaps.

**Recommendation List**

Each card displays:

- Job title.
- Organization.
- Country and city.
- Employment type.
- Matching score.
- Eligibility status.
- Key matched criteria.
- Key missing requirement.
- View Details action.
- Save/Remove button.

### Ranking

The page must display results ordered by the final deterministic ranking policy in Section 8.

### Empty States

**No saved profile**

Display:

"Create your career profile to get personalized recommendations."

Show "Create Profile" button.

**No opportunities**

Display:

"No opportunities are currently available."

**No strong matches**

Still show evaluated opportunities with appropriate scores and limitations.

Do not invent high scores or hide poor matches simply to make recommendations appear stronger.

---

## 5.4 Opportunity Details Page

**Route:** `/opportunities/[id]`

### Required Information

**Job Overview**

- Role title.
- Fictional organization.
- Country.
- City.
- Employment type.
- Description.

**Job Requirements**

- Required skills.
- Minimum experience.
- Education level and relevant fields.
- Required languages.
- Eligibility conditions.
- Career category.

**Candidate Match**

- Overall score.
- Criteria breakdown.
- Matched skills.
- Missing skills.
- Experience comparison.
- Education comparison.
- Language assessment.
- Location preference result.
- Eligibility findings.

**Actions**

- Save/Remove.
- Back to Recommendations.

### Error Handling

Unknown opportunity ID displays a Not Found page.

Inactive opportunities must not appear as new recommendations.

If a previously saved opportunity becomes inactive, the shortlist may still show it with an "Unavailable" label, but it must not be presented as available.

---

## 5.5 Saved Opportunities Page

**Route:** `/saved`

### Required Features

- Display saved job cards.
- Display matching score using current candidate information.
- Open opportunity details.
- Remove saved opportunity.
- Show empty state.

### Empty State

Title:

"No Saved Opportunities Yet"

Description:

"Explore your recommendations and save opportunities you want to revisit."

Button:

"Explore Recommendations"

### Persistence Requirements

- Save state must persist after refresh.
- Duplicate saved opportunities are prohibited.
- Removal must update the UI.
- Database failures must not display false success messages.

---

# 6. OPPORTUNITY DATA REQUIREMENTS

## 6.1 Data Strategy

The system will use **15 fictional opportunities**.

The original assessment requires at least 10.

Fifteen opportunities provide enough variety to demonstrate matching quality without introducing external job sources.

### Data Workflow

1. Define opportunities in a local JSON file.
2. Validate the dataset.
3. Run an idempotent seed script.
4. Insert/update records in Supabase.
5. Retrieve records through Next.js server-side operations.
6. Feed records into the matching engine.

### Restrictions

- No LinkedIn scraping.
- No Indeed scraping.
- No live recruitment API.
- No actual job advertisements represented as available positions.
- No external content dependency during matching.

## 6.2 Opportunity Data Model

```ts
type Opportunity = {
  id: string;
  slug: string;

  title: string;
  organization: string;

  country: string;
  city: string;

  employmentType:
    | "full_time"
    | "part_time"
    | "internship";

  description: string;
  responsibilities: string[];

  requiredSkills: string[];

  minimumExperienceYears: number;

  minimumEducationLevel:
    | "high_school"
    | "diploma"
    | "bachelors"
    | "masters"
    | "doctorate";

  acceptedEducationFields: string[];

  requiredLanguages: {
    language: string;
    minimumProficiency:
      | "basic"
      | "intermediate"
      | "professional"
      | "fluent"
      | "native";
    mandatory: boolean;
  }[];

  careerCategories: string[];

  eligibility: {
    requiresCurrentEnrollment: boolean;
    requiresLocalWorkAuthorization: boolean;
    additionalConditions: string[];
  };

  isActive: boolean;
};
```

Countries, education fields, skill terms, and language names must use consistent normalized values.

---

# 7. FICTIONAL JOB DATASET

The following opportunity scenarios must be implemented.

All organizations should have fictional names.

| ID | Opportunity | Country | Scenario |
|---|---|---|---|
| J01 | Programme Assistant | Canada | Strong skills match |
| J02 | Project Coordinator | Singapore | Strong match |
| J03 | Business Operations Associate | Germany | Strong match |
| J04 | Research Assistant | Canada | Strong research alignment |
| J05 | Operations Analyst | Singapore | Partial skill gap |
| J06 | Administrative Coordinator | Germany | Partial match |
| J07 | Junior Business Analyst | Canada | Additional analytical skills needed |
| J08 | HR Operations Assistant | Singapore | Partial domain alignment |
| J09 | Business Analyst Intern | Canada | Enrollment and work-authorization constraints |
| J10 | German-speaking Client Associate | Germany | Mandatory German requirement |
| J11 | Senior Project Manager | Canada | Experience gap |
| J12 | Software Engineer | Singapore | Major skill mismatch |
| J13 | Financial Risk Analyst | Germany | Specialized qualification gap |
| J14 | Medical Research Scientist | Canada | Specialized education requirement |
| J15 | Senior Data Engineer | Singapore | Major technical mismatch |

## 7.1 Required Constraint Examples

**J09 — Business Analyst Intern**

Requirements must include:

- Relevant analytical and Excel skills.
- Current student enrollment.
- Local work authorization.

The supplied assessment candidate has a completed bachelor's degree, but no current enrollment status is provided.

The matching engine must treat unknown enrollment as requiring verification rather than assuming current enrollment.

**J10 — German-speaking Client Associate**

Requirements must include:

- Professional German proficiency.
- Customer-facing communication skills.
- Germany location.

The assessment candidate has English and Bengali listed but not German.

The engine must identify the missing mandatory language.

## 7.2 Dataset Distribution

The dataset must intentionally contain:

- Several strong qualifications matches.
- Several partial qualifications matches.
- Several poor matches.
- At least two explicit language or eligibility constraints.
- At least one experience mismatch.
- At least one education mismatch.
- At least one unknown eligibility situation.

Expected scenarios are test-design targets, not hardcoded recommendation results.

The matching engine must calculate actual outcomes from the data.

---

# 8. MATCHING ENGINE SPECIFICATION

This is the most important module in the project.

## 8.1 Matching Architecture

The engine will be implemented as pure TypeScript functions.

It will not depend on:

- React state.
- Supabase SDK calls.
- External APIs.
- AI models.

### Input

- Candidate profile.
- Opportunity record.

### Output

A structured matching result.

```ts
type MatchResult = {
  opportunityId: string;

  score: number;

  criterionScores: {
    skills: number;
    experience: number;
    education: number;
    location: number;
    language: number;
  };

  eligibilityStatus:
    | "no_identified_blocker"
    | "requires_verification"
    | "blocked";

  matchedSkills: string[];
  missingSkills: string[];

  strengths: string[];
  gaps: string[];
  warnings: string[];

  explanation: string;
};
```

The match score ranges from 0 to 100.

Eligibility is evaluated separately.

## 8.2 Scoring Weights

| Criterion | Weight |
|---|---:|
| Skills | 35 |
| Experience | 20 |
| Education | 15 |
| Preferred Location | 15 |
| Language | 15 |
| **Total** | **100** |

These are explicitly chosen MVP weights. They are not supplied by the recruitment team.

### Formula

`Total Score = Skill Points + Experience Points + Education Points + Location Points + Language Points`

Every criterion returns a normalized score between 0 and 1.

Weighted points are calculated from that normalized score.

Round only the final score to the nearest integer.

## 8.3 Skill Matching

Normalize:

- Letter casing.
- Whitespace.
- Known configured aliases.

Example:

`MS Excel` and `Microsoft Excel` may resolve to `excel`.

Unrelated concepts must not be treated as equivalent.

### Formula

`Skill Ratio = Matched Required Skills / Total Required Skills`

`Skill Points = Skill Ratio × 35`

Example:

Required skills:

- Excel
- Research
- Reporting
- Project Coordination

Candidate has three of these four skills.

Skill ratio:

`3 / 4 = 0.75`

Weighted points:

`0.75 × 35 = 26.25`

If an opportunity defines no required skills, use a neutral normalized score of 0.5 and add a data-quality warning. Do not silently assign full credit.

## 8.4 Experience Matching

Compare candidate experience with minimum required experience.

### Rules

If minimum experience is zero:

`Experience Score = 1`

If candidate meets or exceeds minimum:

`Experience Score = 1`

If candidate falls below minimum:

`Experience Score = Candidate Years / Required Years`

Clamp the result between 0 and 1.

### Example

Candidate: 2 years.

Requirement: 4 years.

`Experience Score = 2 / 4 = 0.5`

`Experience Points = 0.5 × 20 = 10`

Years of experience are a simplified proxy and must not imply equivalent professional responsibility across unrelated fields.

## 8.5 Education Matching

Education must be evaluated using both:

1. Qualification level.
2. Relevant field of study.

### Level Order

`high_school → diploma → bachelors → masters → doctorate`

### Education Level Score

- Meets or exceeds required level: 1.
- Does not meet required level: 0.

### Field Score

- Field matches an accepted field or configured equivalence: 1.
- Field does not match: 0.
- Opportunity accepts any field: 1.

### Education Score

`Education Score = (Level Score + Field Score) / 2`

`Education Points = Education Score × 15`

Specialized qualifications must not be inferred from unrelated degrees.

The complete education requirement is satisfied only when both level and accepted-field conditions are met.

## 8.6 Location Matching

If opportunity country exists in preferred countries:

`Location Score = 1`

Otherwise:

`Location Score = 0`

`Location Points = Location Score × 15`

A location preference match does not imply immigration or employment eligibility.

## 8.7 Language Matching

Proficiency levels:

1. Basic.
2. Intermediate.
3. Professional.
4. Fluent.
5. Native.

A candidate satisfies a language requirement when:

- The language matches.
- Candidate proficiency is greater than or equal to the required level.

### Scoring

For every required language:

- Satisfied: 1.
- Not satisfied: 0.

Language score is the proportion of required languages satisfied.

`Language Points = Language Score × 15`

If no language requirement exists, assign full language credit because the opportunity imposes no language restriction.

Mandatory language failures are additionally evaluated as hard constraints.

## 8.8 Eligibility Engine

Eligibility is independent of numerical matching.

### Supported Statuses

**`no_identified_blocker`**

No configured mandatory condition has been found unsatisfied or unknown.

This status is not a verified legal determination.

**`requires_verification`**

One or more mandatory conditions cannot be verified from available candidate information.

**`blocked`**

A configured mandatory requirement is explicitly not satisfied.

### Work Authorization Logic

For a role requiring work authorization in a specific country:

| Candidate Information | Result |
|---|---|
| Confirmed authorization supplied | Condition satisfied |
| Authorization unknown | Requires Verification |
| Explicitly no authorization | Blocked |

The system must not independently validate the legal correctness of candidate-supplied authorization information.

### Enrollment Logic

| Candidate Status | Internship Requires Enrollment |
|---|---|
| Currently enrolled | Condition satisfied |
| Not enrolled | Blocked |
| Unknown | Requires Verification |

### Mandatory Language Logic

A mandatory language requirement is blocked if the candidate's declared language list and proficiency do not meet it.

A missing or incomplete candidate language record should be treated as unknown when appropriate rather than fabricated as a confirmed mismatch.

### Overall Eligibility Priority

1. Any confirmed hard-constraint failure → `blocked`.
2. Otherwise, any unknown mandatory condition → `requires_verification`.
3. Otherwise → `no_identified_blocker`.

The user-facing UI must clearly distinguish an apparent match from verified authorization.

## 8.9 Recommendation Ranking

Rank results using:

1. Eligibility group.
2. Descending numerical matching score.
3. Stable opportunity ID as a tie-breaker.

Priority:

`no_identified_blocker → requires_verification → blocked`

The score must remain visible for every result.

The UI should explain when eligibility grouping causes a higher-scoring opportunity to appear below a lower-scoring one.

Do not remove blocked opportunities from the underlying evaluation results.

## 8.10 Match Explanations

All explanations must be generated from structured evaluation results.

### Required Explanation Fields

- Matched skills.
- Missing skills.
- Experience alignment.
- Education alignment.
- Language alignment.
- Location alignment.
- Eligibility findings.

### Example

"Your Excel, reporting, and project coordination skills align with this opportunity. Your two years of experience meet the stated minimum. However, local work authorization has not been verified."

Explanations must not claim:

- Guaranteed employment.
- Confirmed visa eligibility.
- Guaranteed job suitability.
- Verified credentials.
- Confirmed legal work permission.

## 8.11 Missing Data Handling

The engine must distinguish:

- Requirement not applicable.
- Candidate information unknown.
- Candidate information explicitly insufficient.
- Invalid opportunity data.

Never interpret unknown candidate eligibility as satisfied.

Invalid opportunity records should be identified during dataset validation and excluded from normal ranking with a logged validation error.

Missing optional descriptions must not break scoring.

---

# 9. SUPABASE DATABASE SPECIFICATION

Use three application tables.

Supabase Auth manages the anonymous user identity.

## 9.1 Table: `candidate_profiles`

| Column | Type | Constraint |
|---|---|---|
| id | UUID | Primary Key, references `auth.users.id` |
| education_level | TEXT | Not Null |
| field_of_study | TEXT | Not Null |
| experience_years | NUMERIC | Non-negative |
| experience_description | TEXT | Not Null |
| skills | JSONB | Not Null |
| languages | JSONB | Not Null |
| preferred_countries | JSONB | Not Null |
| career_interests | JSONB | Not Null |
| work_authorizations | JSONB | Not Null |
| student_status | TEXT | Not Null |
| created_at | TIMESTAMPTZ | Default now |
| updated_at | TIMESTAMPTZ | Managed on update |

`id` is the authenticated Supabase user ID.

Each anonymous user has at most one candidate profile.

### Example Language Data

```json
[
  {
    "language": "Bengali",
    "proficiency": "native"
  },
  {
    "language": "English",
    "proficiency": "professional"
  }
]
```

### Example Work Authorization Data

```json
{
  "Germany": "unknown",
  "Canada": "unknown",
  "Singapore": "unknown"
}
```

## 9.2 Table: `opportunities`

| Column | Type | Constraint |
|---|---|---|
| id | UUID | Primary Key |
| slug | TEXT | Unique |
| title | TEXT | Not Null |
| organization | TEXT | Not Null |
| country | TEXT | Not Null |
| city | TEXT | Not Null |
| employment_type | TEXT | Not Null |
| description | TEXT | Not Null |
| responsibilities | JSONB | Default empty array |
| required_skills | JSONB | Not Null |
| minimum_experience_years | NUMERIC | Non-negative |
| minimum_education_level | TEXT | Not Null |
| accepted_education_fields | JSONB | Not Null |
| required_languages | JSONB | Not Null |
| career_categories | JSONB | Not Null |
| eligibility | JSONB | Not Null |
| is_active | BOOLEAN | Default true |
| created_at | TIMESTAMPTZ | Default now |

Opportunity identifiers must be stable across repeatable seed operations.

The `slug` must also be stable and unique.

## 9.3 Table: `saved_opportunities`

| Column | Type | Constraint |
|---|---|---|
| id | UUID | Primary Key |
| candidate_id | UUID | References `auth.users.id` |
| opportunity_id | UUID | References opportunities |
| created_at | TIMESTAMPTZ | Default now |

Add:

`UNIQUE(candidate_id, opportunity_id)`

This prevents duplicate shortlist records.

## 9.4 Row Level Security

Enable RLS for every application table.

### Candidate Profiles

SELECT, INSERT, UPDATE:

`auth.uid() = id`

No public access to another candidate's profile.

### Opportunities

SELECT:

Allow reading active fictional opportunities.

INSERT, UPDATE, DELETE:

Not available to anonymous users.

Seed operations use a privileged server-side or local script environment.

### Saved Opportunities

SELECT, INSERT, DELETE:

`auth.uid() = candidate_id`

No user may access another user's shortlist.

### Privileged Keys

- Never expose a Supabase service-role or secret key in browser code.
- Never use privileged keys with a `NEXT_PUBLIC_` prefix.
- Keep privileged seed access separate from ordinary request handling.
- Use the authenticated Supabase session for candidate operations.

## 9.5 Database Indexes

Required:

- Unique opportunity slug.
- Unique saved candidate/opportunity pair.
- Index on `saved_opportunities.candidate_id`.

Optional:

- Index on opportunity active status.

---

# 10. AUTHENTICATION & SESSION FLOW

## 10.1 Anonymous Session

When the user first accesses a protected user workflow:

1. Check for an existing Supabase session.
2. If none exists, initiate anonymous sign-in.
3. Receive the authenticated Supabase user session.
4. Use the authenticated user ID for candidate-specific operations.
5. Load the user's profile when present.

Anonymous sign-in must be enabled in Supabase project settings.

## 10.2 Session Security

Use Supabase-supported cookie-based SSR session handling.

Server-side operations must resolve the user through a verified Supabase Auth session.

Never trust an arbitrary `userId` supplied in the request body as proof of ownership.

## 10.3 No Login UI

The assessment does not require a registration or login screen.

Therefore:

- No email input for authentication.
- No password form.
- No OAuth integration.
- No account verification workflow.

---

# 11. NEXT.JS API SPECIFICATION

Use App Router Route Handlers.

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/profile` | Retrieve own profile |
| PUT | `/api/profile` | Create or update own profile |
| GET | `/api/opportunities` | List active opportunities |
| GET | `/api/opportunities/[id]` | Get opportunity details |
| POST | `/api/match` | Calculate recommendations |
| GET | `/api/saved` | List saved opportunities |
| POST | `/api/saved` | Save opportunity |
| DELETE | `/api/saved/[id]` | Remove saved opportunity |

## 11.1 Profile API

`GET /api/profile`

Returns the authenticated candidate's profile or an explicit not-found response.

`PUT /api/profile`

Validates input and performs an upsert for the authenticated user.

The user ID must come from the verified session.

## 11.2 Opportunities API

`GET /api/opportunities`

Returns active opportunities.

`GET /api/opportunities/[id]`

Returns a specific active opportunity or 404.

The API must not expose privileged database information.

## 11.3 Matching API

`POST /api/match`

### Server Flow

1. Validate the candidate session.
2. Load the candidate profile.
3. Load active opportunities.
4. Validate domain data.
5. Run deterministic matching.
6. Evaluate constraints.
7. Generate explanations.
8. Sort results.
9. Return structured results.

### Response Structure

```json
{
  "total": 15,
  "results": [
    {
      "opportunityId": "uuid",
      "score": 86,
      "eligibilityStatus": "requires_verification",
      "criterionScores": {
        "skills": 0.75,
        "experience": 1,
        "education": 1,
        "location": 1,
        "language": 1
      },
      "matchedSkills": [
        "Excel",
        "Reporting"
      ],
      "missingSkills": [
        "Presentation"
      ],
      "strengths": [
        "Experience requirement met"
      ],
      "gaps": [
        "Presentation skill not listed"
      ],
      "warnings": [
        "Work authorization requires verification"
      ],
      "explanation": "..."
    }
  ]
}
```

This example illustrates the response structure. The actual score must always be computed by the engine.

## 11.4 Error Response Format

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid candidate profile",
    "details": {}
  }
}
```

### Status Codes

- 400 — Invalid input.
- 401 — No valid authenticated session.
- 404 — Resource not found.
- 409 — Conflict, where applicable.
- 500 — Unexpected server failure.
- 503 — Database/service unavailable.

Do not expose raw database errors to users.

---

# 12. MOCK / FALLBACK MODE

The original assessment requires external integrations to be documented and runnable with an appropriate fallback or mock mode.

Since Supabase is an external hosted dependency, the application will support:

**Database Mode:** `supabase`

**Demo Mode:** `mock`

Use an explicit environment configuration to select the mode.

## 12.1 Supabase Mode

- Profiles stored in Supabase.
- Opportunities retrieved from Supabase.
- Shortlists stored in Supabase.
- Supabase Anonymous Auth provides identity.

## 12.2 Mock Mode

- Opportunities loaded from bundled local JSON.
- Profile stored in browser localStorage.
- Shortlist stored in browser localStorage.
- Matching uses the same pure TypeScript engine.
- No Supabase credentials required.

Mock mode must be restricted to a clearly identified local/demo environment.

It must not make claims about secure multi-user persistence.

## 12.3 Consistency Requirement

Both modes must use identical:

- Opportunity schemas.
- Candidate schemas.
- Matching rules.
- Explanation logic.
- Score calculation.

Differences are limited to persistence and session handling.

---

# 13. FRONTEND DESIGN SYSTEM

## 13.1 Design Philosophy

The UI should be:

- Minimal.
- Professional.
- Modern.
- Trustworthy.
- Accessible.
- Responsive.
- Consistent.

Avoid excessive gradients, animations, or decorative elements that distract from job matching information.

## 13.2 Color Palette

| Token | Color |
|---|---|
| Primary | `#2563EB` |
| Background | `#F8FAFC` |
| Surface | `#FFFFFF` |
| Text Primary | `#0F172A` |
| Text Secondary | `#64748B` |
| Border | `#E2E8F0` |
| Success | `#10B981` |
| Warning | `#F59E0B` |
| Error | `#EF4444` |

Define colors as theme tokens.

Do not scatter hardcoded colors throughout React components.

## 13.3 Typography

Primary font: Inter.

Recommended scale:

| Element | Desktop | Mobile |
|---|---|---|
| Hero | 48px | 32px |
| Page Title | 32px | 26px |
| Section Title | 24px | 21px |
| Card Title | 18px | 17px |
| Body | 16px | 15px |
| Secondary | 14px | 14px |
| Caption | 12px | 12px |

## 13.4 Layout

- Maximum content width: 1200px.
- Desktop horizontal padding: 32px.
- Tablet horizontal padding: 24px.
- Mobile horizontal padding: 16px.
- Section spacing: 64px desktop, 40px mobile.
- Card padding: 24px desktop, 16px mobile.
- Card radius: 12px.
- Button radius: 8px.
- Standard field height: 44px minimum.

## 13.5 Responsive Breakpoints

- Mobile: 320–767px.
- Tablet: 768–1023px.
- Desktop: 1024px and above.

Avoid fixed-width elements that break on narrow mobile devices.

## 13.6 Component Library

Use shadcn/ui for:

- Button.
- Input.
- Textarea.
- Select.
- Card.
- Badge.
- Tabs where needed.
- Skeleton.
- Alert.
- Separator.
- Form-related controls.

Do not install large visualization or animation libraries unless necessary.

## 13.7 Accessibility

- All inputs have accessible labels.
- Form errors are associated with inputs.
- Buttons support keyboard interaction.
- Focus indicators are visible.
- Status information is not communicated using color alone.
- Loading and error states have readable text.
- Cards and interactive elements have accessible names.

---

# 14. COMPONENT ARCHITECTURE

## 14.1 Shared Layout

- `site-header.tsx`
- `site-footer.tsx`
- `page-container.tsx`
- `page-heading.tsx`

## 14.2 Profile Components

- `candidate-profile-form.tsx`
- `education-section.tsx`
- `experience-section.tsx`
- `skills-input.tsx`
- `language-input.tsx`
- `country-selector.tsx`
- `career-interest-selector.tsx`
- `eligibility-section.tsx`

## 14.3 Opportunity Components

- `opportunity-card.tsx`
- `opportunity-list.tsx`
- `opportunity-header.tsx`
- `opportunity-requirements.tsx`
- `opportunity-empty-state.tsx`

## 14.4 Matching Components

- `match-score.tsx`
- `match-breakdown.tsx`
- `match-strengths.tsx`
- `match-gaps.tsx`
- `eligibility-status.tsx`
- `recommendation-card.tsx`

## 14.5 Shortlist Components

- `save-opportunity-button.tsx`
- `saved-opportunity-list.tsx`
- `saved-empty-state.tsx`

Reusable components must receive typed props.

Business logic must not be duplicated across pages.

---

# 15. PROJECT FOLDER STRUCTURE

```text
career-mobility-platform/
│
├── public/
│
├── scripts/
│   └── seed-opportunities.ts
│
├── src/
│   │
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── globals.css
│   │   ├── loading.tsx
│   │   ├── error.tsx
│   │   ├── not-found.tsx
│   │   │
│   │   ├── profile/
│   │   │   ├── page.tsx
│   │   │   └── loading.tsx
│   │   │
│   │   ├── recommendations/
│   │   │   ├── page.tsx
│   │   │   └── loading.tsx
│   │   │
│   │   ├── opportunities/
│   │   │   └── [id]/
│   │   │       └── page.tsx
│   │   │
│   │   ├── saved/
│   │   │   └── page.tsx
│   │   │
│   │   └── api/
│   │       ├── profile/
│   │       │   └── route.ts
│   │       ├── opportunities/
│   │       │   ├── route.ts
│   │       │   └── [id]/
│   │       │       └── route.ts
│   │       ├── match/
│   │       │   └── route.ts
│   │       └── saved/
│   │           ├── route.ts
│   │           └── [id]/
│   │               └── route.ts
│   │
│   ├── components/
│   │   ├── ui/
│   │   ├── layout/
│   │   ├── profile/
│   │   ├── opportunities/
│   │   ├── matching/
│   │   └── shortlist/
│   │
│   ├── features/
│   │   ├── candidate/
│   │   ├── opportunities/
│   │   ├── shortlist/
│   │   └── matching/
│   │       ├── engine.ts
│   │       ├── scoring.ts
│   │       ├── skills.ts
│   │       ├── experience.ts
│   │       ├── education.ts
│   │       ├── location.ts
│   │       ├── language.ts
│   │       ├── eligibility.ts
│   │       ├── explanations.ts
│   │       └── ranking.ts
│   │
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts
│   │   │   ├── server.ts
│   │   │   └── admin.ts
│   │   ├── repositories/
│   │   │   ├── profile-repository.ts
│   │   │   ├── opportunity-repository.ts
│   │   │   └── shortlist-repository.ts
│   │   ├── validation/
│   │   │   ├── profile-schema.ts
│   │   │   └── opportunity-schema.ts
│   │   ├── mock/
│   │   │   ├── mock-profile.ts
│   │   │   ├── mock-opportunities.ts
│   │   │   └── mock-shortlist.ts
│   │   └── utils.ts
│   │
│   ├── types/
│   │   ├── candidate.ts
│   │   ├── opportunity.ts
│   │   ├── matching.ts
│   │   └── api.ts
│   │
│   └── data/
│       ├── opportunities.json
│       └── sample-profile.json
│
├── tests/
│   ├── matching.test.ts
│   ├── eligibility.test.ts
│   ├── ranking.test.ts
│   └── profile-validation.test.ts
│
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql
│
├── docs/
│   ├── technical-note.md
│   ├── test-evidence.md
│   └── ai-tool-disclosure.md
│
├── .env.example
├── .gitignore
├── README.md
├── package.json
├── tsconfig.json
└── next.config.ts
```

Files and component names may be reorganized only if the same responsibilities and functionality are preserved.

---

# 16. STATE MANAGEMENT

Use:

- React component state for temporary UI interactions.
- Supabase for persistent user data.
- Server Components for initial data retrieval where appropriate.
- Client Components for interactive forms and shortlist actions.

Do not add Redux, Zustand, or another global state library for this small prototype.

## 16.1 Source of Truth

| Data | Source of Truth |
|---|---|
| Candidate Profile | Supabase |
| Opportunity Dataset | Supabase |
| Saved Opportunities | Supabase |
| Matching Results | Computed on request |
| Temporary Form State | React |
| UI Loading State | React/Next.js |

Mock mode substitutes local JSON and localStorage for the relevant persistence sources.

## 16.2 Matching Persistence

Do not store match scores permanently in the database.

Recalculate them from the current candidate profile and current opportunity dataset.

This avoids stale results when the profile changes.

---

# 17. TESTING PLAN

Testing must cover the matching logic and complete user flow.

## 17.1 Mandatory Assessment Scenarios

### T-01 — Strong Match

Given a relevant candidate profile and compatible opportunity:

- Score reflects matching requirements.
- Matching strengths are listed.
- No unsupported claims appear.

### T-02 — Partial Match

Given a candidate missing some requirements:

- Score decreases appropriately.
- Missing criteria are identified.
- Explanations remain accurate.

### T-03 — Critical Requirement Gap

Given a candidate explicitly not enrolled:

- Student-only internship is marked blocked.
- The reason is displayed.
- The opportunity is not represented as eligible.

## 17.2 Additional Tests

### T-04 — Unknown Work Authorization

Expected:

`requires_verification`

### T-05 — Missing German

Expected:

Mandatory language failure identified.

### T-06 — Insufficient Experience

Expected:

Experience points calculated proportionally.

### T-07 — Education Mismatch

Expected:

Relevant education gap recorded.

### T-08 — Duplicate Skills

Expected:

Duplicate skills are normalized and counted once.

### T-09 — Invalid Profile

Expected:

Input rejected with appropriate error.

### T-10 — Deterministic Ranking

Expected:

Same profile and dataset produce identical results.

### T-11 — Save Opportunity

Expected:

Record is persisted.

### T-12 — Duplicate Save

Expected:

Duplicate record is not created.

### T-13 — Remove Opportunity

Expected:

Saved record is removed.

### T-14 — Session Isolation

Expected:

A candidate cannot retrieve another candidate's private records.

### T-15 — Profile Update

Expected:

Changing skills or experience changes matching results appropriately.

## 17.3 Test Evidence

The submission must contain documented results for:

- Strong match.
- Partial match.
- Critical eligibility/requirement gap.

Include:

- Test input.
- Expected behavior.
- Actual result.
- Pass/fail outcome.

Automated test output and screenshots can be included.

---

# 18. ERROR HANDLING

## 18.1 Frontend Errors

Handle:

- Missing required fields.
- Invalid experience values.
- Unavailable data.
- Failed profile saves.
- Failed shortlist actions.
- Invalid opportunity IDs.
- Missing profile.
- No matching opportunities.

## 18.2 Backend Errors

Handle:

- Invalid request payload.
- Expired/invalid session.
- Supabase read failure.
- Supabase write failure.
- Invalid opportunity data.
- Unexpected matching failure.

## 18.3 Required Behavior

- No silent failures.
- No false success notifications.
- No fabricated recommendations.
- No exposure of secret credentials.
- No raw stack traces shown to users.
- Clear error messages and reasonable recovery actions.

---

# 19. SECURITY AND PRIVACY

## 19.1 Required Controls

- Supabase Row Level Security.
- Server-side session verification.
- Input validation.
- Restricted database writes.
- Protected secret keys.
- Parameterized database operations through the SDK.
- No real personal data in the assessment dataset.

## 19.2 Sensitive Information

Career profiles may contain personal information.

For this assessment, use the fictional candidate profile.

Do not upload real resumes, identity documents, or sensitive immigration documents.

## 19.3 Production Considerations

Document the following as future requirements:

- Strong user authentication.
- Account recovery.
- Data deletion/export.
- Retention policies.
- Privacy notices.
- Monitoring.
- Audit logging.
- Secure authorization reviews.

These are not required as complete production features in the MVP.

---

# 20. PERFORMANCE REQUIREMENTS

The prototype should:

- Load the small fictional dataset reliably.
- Calculate matching results without external AI calls.
- Avoid unnecessary database round trips.
- Use a single opportunity fetch for a recommendation calculation.
- Avoid client/server rendering mismatches.
- Display loading feedback during network operations.
- Keep matching logic computationally simple.

No arbitrary numerical performance SLA is required.

---

# 21. DEVELOPMENT PHASES

## Phase 01 — Project Foundation

Tasks:

1. Initialize Next.js App Router project.
2. Configure TypeScript.
3. Configure Tailwind CSS.
4. Initialize shadcn/ui.
5. Configure Supabase.
6. Define environment variables.
7. Create database migrations.
8. Configure Row Level Security.

**Definition of Done:**

App runs and a test query confirms Supabase connectivity.

## Phase 02 — Data Foundation

Tasks:

1. Define domain models.
2. Create 15 fictional opportunity records.
3. Create sample assessment profile.
4. Validate dataset consistency.
5. Implement seed script.
6. Import opportunities into Supabase.
7. Build opportunity repository.

**Definition of Done:**

The database contains all sample opportunities and the application can retrieve them.

## Phase 03 — Matching Engine

Tasks:

1. Build skill evaluator.
2. Build experience evaluator.
3. Build education evaluator.
4. Build location evaluator.
5. Build language evaluator.
6. Build eligibility evaluator.
7. Build score aggregator.
8. Build explanation generator.
9. Build ranking function.
10. Write unit tests.

**Definition of Done:**

Engine produces repeatable scores and passes critical matching tests.

## Phase 04 — Candidate Profile

Tasks:

1. Create profile UI.
2. Build form components.
3. Implement validation.
4. Implement Supabase persistence.
5. Support existing-profile editing.
6. Connect profile saving to recommendations.

**Definition of Done:**

Candidate can create, save, reload, and update their profile.

## Phase 05 — Recommendations & Details

Tasks:

1. Build recommendations page.
2. Connect matching API.
3. Build opportunity cards.
4. Display scores.
5. Display eligibility states.
6. Display strengths and gaps.
7. Build opportunity details page.

**Definition of Done:**

A saved candidate profile produces visible, understandable, ranked results.

## Phase 06 — Shortlisting

Tasks:

1. Implement save endpoint.
2. Implement remove endpoint.
3. Build save/unsave button.
4. Build saved opportunities page.
5. Verify shortlist persistence.

**Definition of Done:**

Shortlist actions work correctly after navigation and refresh.

## Phase 07 — Verification & Submission

Tasks:

1. Execute matching tests.
2. Execute eligibility tests.
3. Verify profile editing.
4. Verify shortlist functionality.
5. Verify responsive pages.
6. Verify Supabase RLS.
7. Verify mock mode.
8. Write technical note.
9. Write README.
10. Prepare AI/tool disclosure.
11. Collect test evidence.
12. Optionally deploy a live demo.

**Definition of Done:**

Project is runnable, demonstrable, and fully documented.

---

# 22. SUBMISSION DELIVERABLES

## D-01 — Working Application

A runnable prototype demonstrating the complete candidate profile to shortlist workflow.

Provide a live demo URL if available.

Otherwise provide local setup instructions.

## D-02 — Source Code

Provide:

- Git repository URL or ZIP archive.
- Complete source code.
- Required configuration examples.
- Reproducible seed data.
- Database migration files.

## D-03 — README

The README must document:

- Project purpose.
- Technology stack.
- Prerequisites.
- Installation.
- Environment configuration.
- Supabase setup.
- Anonymous authentication setup.
- Database migrations.
- Seeding.
- Local run commands.
- Mock mode.
- Test commands.
- Known limitations.

## D-04 — Technical Note

Prepare a concise 1–2 page technical note containing:

- Architecture overview.
- Frontend responsibilities.
- Backend responsibilities.
- Database design.
- Matching methodology.
- Eligibility strategy.
- Key trade-offs.
- Security considerations.
- Known limitations.

## D-05 — Test Evidence

Include evidence for at least:

1. Strong match.
2. Partial match.
3. Critical requirement gap.

## D-06 — AI and Tool Disclosure

Identify AI-assisted tools, libraries, and external services actually used.

Explain:

- Which tools were used.
- What they were used for.
- Which decisions and implementations were verified by the developer.

Do not claim that AI tools were unused if they contributed to the project.

---

# 23. SUBMISSION INSTRUCTIONS

The assessment specifies:

**Submission Window:** 72 hours from receipt unless another deadline is agreed.

**Email Subject:**

`Technical Assessment – Full-Stack Developer – [Your Name]`

The submission must:

- Include the candidate's full name.
- Provide all required repository and demo links.
- Ensure reviewers have access.
- Include working setup instructions.
- Explain incomplete functionality honestly.
- Describe how any incomplete features would be implemented.

The application may be reviewed through a live follow-up demonstration.

The candidate should be prepared to:

- Explain the architecture.
- Explain matching scores.
- Demonstrate eligibility handling.
- Make a small code modification.
- Troubleshoot a simple issue.

---

# 24. ACCEPTANCE CRITERIA

The following checklist is mandatory.

## Profile

- [ ] Candidate profile can be created.
- [ ] Candidate profile can be edited.
- [ ] Education is captured.
- [ ] Skills are captured.
- [ ] Experience is captured.
- [ ] Languages are captured.
- [ ] Preferred countries are captured.
- [ ] Career interests are captured.
- [ ] Work authorization can remain unknown.
- [ ] Invalid input is rejected.

## Opportunities

- [ ] At least 10 fictional opportunities exist.
- [ ] Exactly 15 opportunities are included in the planned seed dataset.
- [ ] Opportunities contain structured requirements.
- [ ] At least two explicit hard-constraint scenarios exist.
- [ ] Strong, partial, and poor matching scenarios exist.
- [ ] Opportunities are loaded successfully.

## Matching

- [ ] Skills are evaluated.
- [ ] Experience is evaluated.
- [ ] Education is evaluated.
- [ ] Location is evaluated.
- [ ] Language is evaluated.
- [ ] Eligibility constraints are evaluated.
- [ ] Results have deterministic scores.
- [ ] Results are ranked consistently.
- [ ] Strengths are explained.
- [ ] Gaps are explained.
- [ ] Unknown work authorization is flagged.
- [ ] Confirmed hard-constraint failures are distinguished from unknown states.

## Opportunity Interaction

- [ ] Opportunity details page works.
- [ ] Save functionality works.
- [ ] Remove functionality works.
- [ ] Duplicate saves are prevented.
- [ ] Shortlisted opportunities persist.

## Technical Quality

- [ ] Uses Next.js App Router.
- [ ] Uses TypeScript.
- [ ] Uses Supabase.
- [ ] No separate backend service.
- [ ] No live job API dependency.
- [ ] No paid AI API requirement.
- [ ] Supabase RLS configured.
- [ ] Server-side session verification works.
- [ ] Missing data is handled.
- [ ] Error states are handled.
- [ ] Mock mode works.
- [ ] Core functionality is responsive.

## Documentation

- [ ] README completed.
- [ ] Technical note completed.
- [ ] Three mandatory test scenarios documented.
- [ ] AI/tool usage disclosed.
- [ ] Setup instructions verified.
- [ ] Submission links accessible.

---

# 25. FINAL DEFINITION OF DONE

The project is complete only when a reviewer can:

1. Open the application.
2. Create or load the provided fictional candidate profile.
3. Save the profile.
4. Generate recommendations from the seeded opportunities.
5. View deterministic ranked results.
6. Understand why each opportunity has its score.
7. Identify missing qualifications and eligibility concerns.
8. Open full opportunity details.
9. Save and remove an opportunity.
10. Refresh the page without losing the intended persistent shortlist state.
11. Modify the candidate profile and observe updated recommendations.
12. Run the project's documented tests.
13. Understand the architectural decisions from the technical note.
14. Run the application from the provided setup instructions.

**Final Principle:**

Build a complete, reliable, explainable matching workflow rather than an unnecessarily large recruitment platform.

The primary engineering priority is correctness and transparency.

---

# 26. REQUIREMENT TRACEABILITY

The original technical assessment defines the following requirements:

| Assessment Section | PRD Coverage |
|---|---|
| 01 — Product Challenge | Sections 1–4 |
| 02 — Functional Requirements | Sections 5–7 |
| 03 — Matching Logic | Section 8 |
| 04 — Sample Test Profile | Sections 7 and 17 |
| 05 — Technical Expectations | Sections 9–20 |
| 06 — Deliverables | Section 22 |
| 07 — Submission Instructions | Section 23 |
| 08 — Assessment Criteria | Sections 17, 21, 24 and 25 |

The assessment's scoring priorities are:

- Functional completeness — 25%.
- Technical implementation — 20%.
- Matching quality and reasoning — 20%.
- Problem-solving and product judgement — 15%.
- Testing, security, and maintainability — 10%.
- Communication and ownership — 10%.

**Scope Authority:** The original assessment is the source of mandatory requirements. Technology choices, scoring weights, anonymous authentication, table definitions, UI styling, and mock-mode design are implementation decisions established in this PRD.

**End of PRD — Version 2.0**
