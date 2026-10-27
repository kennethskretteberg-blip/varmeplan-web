-- 146 (Kenneth 27.10.2026): brukeren maa kunne oppdatere (og, som unntak, opprette) sin EGEN
-- profilrad. ADDITIV og idempotent. Klienten bruker nå UPDATE ... WHERE id = auth.uid()
-- (ikke upsert, som krever INSERT-policy). Ingen INSERT-policy for vanlige brukere.
--
-- Kjør i Supabase SQL editor. Sjekk først med (kun lesing):
--   select policyname, cmd, qual, with_check from pg_policies
--   where schemaname = 'public' and tablename = 'profiles';

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'profiles'
      and policyname = 'profiles_update_own'
  ) then
    create policy "profiles_update_own" on public.profiles
      for update using (auth.uid() = id) with check (auth.uid() = id);
  end if;
end $$;
