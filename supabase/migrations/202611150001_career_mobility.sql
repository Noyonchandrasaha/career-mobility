-- Apply once to a Supabase project using its SQL editor or migration tooling.
begin;
create table public.candidate_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  education_level text not null check (education_level in ('high_school','diploma','bachelors','masters','doctorate')),
  field_of_study text not null check (length(btrim(field_of_study)) > 0),
  experience_years numeric not null check (experience_years >= 0 and experience_years <> 'NaN'::numeric and experience_years <> 'Infinity'::numeric),
  experience_description text not null check (length(btrim(experience_description)) > 0),
  skills jsonb not null check (jsonb_typeof(skills) = 'array' and jsonb_array_length(skills) > 0),
  languages jsonb not null check (jsonb_typeof(languages) = 'array' and jsonb_array_length(languages) > 0),
  preferred_countries jsonb not null check (jsonb_typeof(preferred_countries) = 'array' and jsonb_array_length(preferred_countries) > 0),
  career_interests jsonb not null check (jsonb_typeof(career_interests) = 'array' and jsonb_array_length(career_interests) > 0),
  work_authorizations jsonb not null default '{}'::jsonb check (jsonb_typeof(work_authorizations) = 'object'),
  student_status text not null default 'unknown' check (student_status in ('yes','no','unknown')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table public.opportunities (
  id uuid primary key,
  slug text not null unique,
  title text not null,
  organization text not null,
  country text not null,
  city text not null,
  employment_type text not null check (employment_type in ('full_time','part_time','internship')),
  description text not null,
  responsibilities jsonb not null default '[]'::jsonb check (jsonb_typeof(responsibilities) = 'array'),
  required_skills jsonb not null check (jsonb_typeof(required_skills) = 'array'),
  minimum_experience_years numeric not null check (minimum_experience_years >= 0 and minimum_experience_years <> 'NaN'::numeric and minimum_experience_years <> 'Infinity'::numeric),
  minimum_education_level text not null check (minimum_education_level in ('high_school','diploma','bachelors','masters','doctorate')),
  accepted_education_fields jsonb not null check (jsonb_typeof(accepted_education_fields) = 'array'),
  required_languages jsonb not null check (jsonb_typeof(required_languages) = 'array'),
  career_categories jsonb not null check (jsonb_typeof(career_categories) = 'array'),
  eligibility jsonb not null check (jsonb_typeof(eligibility) = 'object'),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);
create table public.saved_opportunities (
  id uuid primary key default gen_random_uuid(),
  candidate_id uuid not null references auth.users(id) on delete cascade,
  opportunity_id uuid not null references public.opportunities(id),
  created_at timestamptz not null default now(),
  unique (candidate_id, opportunity_id)
);
create index saved_opportunities_candidate_id_idx on public.saved_opportunities(candidate_id);
create function public.set_profile_updated_at() returns trigger
language plpgsql set search_path = '' as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
create trigger candidate_profiles_updated_at before update on public.candidate_profiles
for each row execute function public.set_profile_updated_at();

alter table public.candidate_profiles enable row level security;
alter table public.opportunities enable row level security;
alter table public.saved_opportunities enable row level security;
revoke all on public.candidate_profiles, public.opportunities, public.saved_opportunities from anon, authenticated;
grant usage on schema public to anon, authenticated;
grant select on public.opportunities to anon, authenticated;
grant select, insert, update on public.candidate_profiles to authenticated;
grant select, insert, delete on public.saved_opportunities to authenticated;
-- Only the local seed environment uses this bypass role.
grant all on public.candidate_profiles, public.opportunities, public.saved_opportunities to service_role;

create policy profiles_read_own on public.candidate_profiles for select to authenticated
using ((select auth.uid()) = id);
create policy profiles_insert_own on public.candidate_profiles for insert to authenticated
with check ((select auth.uid()) = id);
create policy profiles_update_own on public.candidate_profiles for update to authenticated
using ((select auth.uid()) = id) with check ((select auth.uid()) = id);
create policy opportunities_read_active on public.opportunities for select to anon, authenticated
using (is_active = true);
create policy saved_read_own on public.saved_opportunities for select to authenticated
using ((select auth.uid()) = candidate_id);
create policy saved_insert_own_active on public.saved_opportunities for insert to authenticated
with check (
  (select auth.uid()) = candidate_id
  and exists (select 1 from public.opportunities o where o.id = opportunity_id and o.is_active)
);
create policy saved_delete_own on public.saved_opportunities for delete to authenticated
using ((select auth.uid()) = candidate_id);
commit;
