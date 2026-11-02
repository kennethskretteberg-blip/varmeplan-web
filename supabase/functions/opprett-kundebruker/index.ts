// ============================================================================
// Supabase Edge Function: opprett-kundebruker   (045, spec-overfor-prosjekt regel 30–31)
// ----------------------------------------------------------------------------
// Cenika (leverandøren) har opprettet en elektrobedrift med create_customer_org() (044v2).
// Den lagde en invitasjon i org_invitations for kontaktpersonen, rolle 'admin'. Denne
// funksjonen gjør invitasjonen om til en KONTO: Supabases inviteUserByEmail oppretter
// brukeren og sender Supabases egen e-post med en sett-passord-lenke. E-posten er
// brukernavnet. Ingen registreringsskjema, ingen «glemt passord»-omvei.
//
// Klienten sender KUN invitasjonens token: { "token": "<org_invitations.token>" }.
// Mottaker, organisasjon og lenke slås opp eller bestemmes her, server-side.
//
// Deploy:  supabase functions deploy opprett-kundebruker
// Secrets: INGEN egne. SUPABASE_URL og SUPABASE_SERVICE_ROLE_KEY er innebygd i kjøretiden.
//          (RESEND_API_KEY / FROM_EMAIL brukes IKKE — e-posten sendes av Supabase Auth.)
// Oppsett i Supabase (Dashboard, ikke kode):
//   * Auth → URL Configuration: https://varmeplan.no må være Site URL eller stå i Redirect URLs,
//     ellers faller lenken tilbake til Site URL.
//   * Auth → Email Templates → «Invite user»: teksten kontaktpersonen får. Endres der.
//   * Auth → SMTP: med Supabases innebygde SMTP er det en lav timegrense på utsendelser.
//     Egen SMTP (f.eks. Resend SMTP på varmeplan.no) bør settes før demoen.
//
// ⚠ HVORFOR FUNKSJONEN LESER Authorization EKSPLISITT
//
// send-invite-email leste aldri Authorization før 07.10.2026, og tok både mottaker og lenke
// fra klientens body — en ferdig phishing-kanal på vårt eget, verifiserte domene. Denne
// funksjonen er farligere enn den var: den OPPRETTER KONTOER med service-role. Derfor:
//
//  1. Supabase sin `verify_jwt` er IKKE et vern. Anon-nøkkelen ER en gyldig JWT og ligger
//     åpent i klienten. Brukeren verifiseres derfor med auth.getUser(jwt) — FØR noe slås opp,
//     så et uinnlogget kall ikke kan lære om et token finnes.
//  2. Kalleren må være medlem av leverandør-orgen som står som created_by_org på
//     organisasjonen invitasjonen gjelder. Funksjonen stoler IKKE på at 044 har sjekket det.
//  3. E-postadressen hentes fra invitasjonsraden, aldri fra body. Redirect-domenet er alltid
//     https://varmeplan.no, aldri kallerens origin (samme regel som kundelenkene, regel 8).
//  4. Svaret er nøytralt: opprettet / fantes fra før / feil. Ukjent, brukt, utløpt token og
//     manglende rett gir SAMME 400-svar. Feildetaljer fra Auth logges, sendes ikke ut.
//
// Når brukeren finnes fra før (spec regel 31): ingen ny konto, ingen e-post. Brukeren legges
// i organisasjonen med invitasjonens rolle, invitasjonen markeres akseptert, og svaret sier
// «fantes fra før». En profil som venter på godkjenning blir aktiv (Cenikas invitasjon ER
// godkjenningen, samme som triggeren handle_invitation_on_signup gjør for nye brukere); en
// avvist eller blokkert profil røres ikke. En bruker som er medlem av en LEVERANDØR-org legges
// aldri inn i en kundebedrift (SPØRSMÅL 15: en Cenika-ansatt skal ikke kunne invitere sin egen
// konto inn og se kundens prosjekter).
//
// Ny bruker: inviteUserByEmail setter inn i auth.users, og de eksisterende triggerne gjør
// resten — on_auth_user_created lager profilen, on_user_check_invitations gir medlemskap med
// invitasjonens rolle, markerer invitasjonen akseptert og gjør profilen aktiv. Funksjonen
// gjør det samme etterpå, idempotent, så den ikke avhenger av at triggeren er live.
// ============================================================================

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// Aldri kallerens origin. Spørreparameteren gjør landingen gjenkjennelig for klienten.
const REDIRECT_TO = "https://varmeplan.no/?velkommen=1";

const UBRUKELIG = "Invitasjonen kan ikke brukes. Be om en ny.";

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status, headers: { ...cors, "Content-Type": "application/json" },
  });
}

// «Brukeren finnes alt» fra GoTrue. Nyere versjoner gir code='email_exists' (422);
// eldre gir bare meldingsteksten.
function erFinnesFraFor(err: { code?: string; status?: number; message?: string } | null): boolean {
  if (!err) return false;
  if (err.code === "email_exists" || err.code === "user_already_exists") return true;
  return /already (been )?registered|already exists/i.test(String(err.message || ""));
}

// ilike uten jokertegn: % og _ i en e-postadresse skal bety seg selv.
const ilikeEksakt = (s: string) => s.replace(/[\\%_]/g, (c) => "\\" + c);

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ ok: false, error: "POST kreves" }, 405);

  try {
    const body = await req.json().catch(() => ({}));
    const token = String(body?.token || "").trim();
    if (!token) return json({ ok: false, error: "token kreves" }, 400);

    const db = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // ── Lag 1: en EKTE bruker, før noe slås opp ──────────────────────────────
    const auth = req.headers.get("Authorization") || "";
    const jwt = auth.startsWith("Bearer ") ? auth.slice(7) : "";
    if (!jwt) return json({ ok: false, error: "innlogging kreves" }, 401);
    const { data: userRes } = await db.auth.getUser(jwt);
    const kaller = userRes?.user;
    if (!kaller) return json({ ok: false, error: "innlogging kreves" }, 401);

    const avvis = (grunn: string) => {
      console.warn("opprett-kundebruker avvist:", grunn, "kaller", kaller.id);
      return json({ ok: false, error: UBRUKELIG }, 400);
    };

    // ── Invitasjonen ─────────────────────────────────────────────────────────
    const { data: inv, error: invErr } = await db.from("org_invitations")
      .select("id, org_id, email, role, status, expires_at")
      .eq("token", token).maybeSingle();
    if (invErr) { console.error("oppslag invitasjon:", invErr.message); return json({ ok: false, error: "feil" }, 500); }
    if (!inv) return avvis("ukjent token");
    if (inv.status !== "pending") return avvis("status " + inv.status);
    if (!inv.expires_at || new Date(inv.expires_at).getTime() <= Date.now()) return avvis("utløpt");
    const email = String(inv.email || "").trim().toLowerCase();
    if (!email || !inv.org_id) return avvis("mangler e-post eller org");
    const rolle = inv.role === "admin" || inv.role === "member" ? inv.role : "member";

    // ── Lag 2: kalleren har rett til å invitere til NETTOPP denne orgen ─────
    const { data: kundeOrg } = await db.from("organizations")
      .select("id, org_type, created_by_org").eq("id", inv.org_id).maybeSingle();
    if (!kundeOrg) return avvis("org finnes ikke");
    if (kundeOrg.org_type !== "installer") return avvis("org er ikke installatør");
    if (!kundeOrg.created_by_org) return avvis("org er ikke opprettet av en leverandør");

    const superadmin =
      (kaller.app_metadata as Record<string, unknown> | undefined)?.is_superadmin === true;
    if (!superadmin) {
      const { data: levOrg } = await db.from("organizations")
        .select("id, org_type").eq("id", kundeOrg.created_by_org).maybeSingle();
      if (!levOrg || levOrg.org_type !== "supplier") return avvis("oppretter er ikke leverandør");
      const { data: medlem } = await db.from("organization_members")
        .select("user_id").eq("org_id", levOrg.id).eq("user_id", kaller.id).maybeSingle();
      if (!medlem) return avvis("kaller er ikke medlem av leverandøren");
    }

    // ── Opprett kontoen ──────────────────────────────────────────────────────
    const { data: invData, error: invUserErr } =
      await db.auth.admin.inviteUserByEmail(email, { redirectTo: REDIRECT_TO });

    let userId: string | null = null;
    let fantesFraFor = false;

    if (invUserErr) {
      if (!erFinnesFraFor(invUserErr)) {
        console.error("inviteUserByEmail:", invUserErr.status, invUserErr.code, invUserErr.message);
        return json({ ok: false, error: "Kunne ikke opprette brukeren. Prøv igjen senere." }, 500);
      }
      // Regel 31: brukeren finnes. Ingen ny konto.
      fantesFraFor = true;
      const { data: prof } = await db.from("profiles")
        .select("id, status").ilike("email", ilikeEksakt(email)).limit(1).maybeSingle();
      if (!prof) {
        console.error("eksisterende bruker uten profil:", email);
        return json({ ok: false, error: "Kunne ikke opprette brukeren. Prøv igjen senere." }, 500);
      }
      userId = prof.id;

      // En leverandør-ansatt legges aldri inn i en kundebedrift (SPØRSMÅL 15).
      const { data: medlemskap } = await db.from("organization_members")
        .select("org_id, organizations(org_type)").eq("user_id", userId);
      const erLeverandor = (medlemskap || []).some((m: any) => m?.organizations?.org_type === "supplier");
      if (erLeverandor) {
        console.warn("e-posten tilhører et leverandør-medlem; ikke lagt inn", inv.id);
        return json({ ok: false, error: "Denne e-postadressen kan ikke brukes for kundebedriften." }, 409);
      }

      if (prof.status === "pending") {
        await db.from("profiles")
          .update({ status: "active", approved_at: new Date().toISOString() })
          .eq("id", userId).eq("status", "pending");
      }
    } else {
      userId = invData?.user?.id ?? null;
      if (!userId) {
        console.error("inviteUserByEmail ga ingen bruker-id");
        return json({ ok: false, error: "Kunne ikke opprette brukeren. Prøv igjen senere." }, 500);
      }
      // Triggeren har normalt gjort profilen aktiv. Gjør det samme her hvis den ikke gjorde det.
      await db.from("profiles")
        .update({ status: "active", approved_at: new Date().toISOString() })
        .eq("id", userId).eq("status", "pending");
    }

    // ── Medlemskap + akseptert (idempotent; triggeren kan ha gjort det alt) ──
    const { error: memErr } = await db.from("organization_members")
      .upsert({ org_id: inv.org_id, user_id: userId, role: rolle },
              { onConflict: "org_id,user_id", ignoreDuplicates: true });
    if (memErr) {
      console.error("medlemskap:", memErr.message);
      return json({ ok: false, error: "Kunne ikke opprette brukeren. Prøv igjen senere." }, 500);
    }
    await db.from("org_invitations").update({ status: "accepted" })
      .eq("id", inv.id).eq("status", "pending");

    return json({ ok: true, result: fantesFraFor ? "fantes_fra_for" : "opprettet" });

  } catch (err) {
    console.error("opprett-kundebruker:", err);
    return json({ ok: false, error: "feil" }, 500);
  }
});
