// ============================================================================
// Supabase Edge Function: kundesoknad-svar   (169)
// ----------------------------------------------------------------------------
// En elektrobedrift registrerte seg selv med «Kunde hos: Cenika». Cenika har godkjent eller
// avslått (approve_customer_org / reject_customer_org, supabase-migration-kundesoknad.sql).
// Denne funksjonen sender søkeren én e-post om utfallet.
//
// Klienten sender KUN organisasjonens id: { "org_id": "<uuid>" }.
// Mottaker, utfall, bedriftsnavn, leverandørnavn og begrunnelse slås opp HER, server-side.
// Samme mønster som send-invite-email (Resend, RESEND_API_KEY/FROM_EMAIL) og opprett-kundebruker
// (eksplisitt auth.getUser, kalleren sjekkes mot leverandør-orgen).
//
// Deploy:  supabase functions deploy kundesoknad-svar
// Secrets: RESEND_API_KEY, FROM_EMAIL — de samme som send-invite-email bruker (alt satt hvis
//          den virker). SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY er innebygd i kjøretiden.
//
// Vern:
//  1. Brukeren verifiseres med auth.getUser(jwt) før noe slås opp (anon-nøkkelen er en gyldig
//     JWT, så `verify_jwt` alene er ikke et vern).
//  2. Kalleren må være medlem av orgens requested_supplier_org_id, og den må være 'supplier'.
//  3. Det må finnes en avgjørelse (customer_request_decision), tatt for under 30 minutter siden.
//  4. Hver avgjørelse gir høyst ÉN e-post: customer_request_notified_at settes betinget
//     (… is null) FØR sending. En kaller kan altså ikke bruke funksjonen til å spamme søkeren.
//  5. Lenken i e-posten er alltid https://varmeplan.no — aldri kallerens origin.
// ============================================================================

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const FROM_DEFAULT = "Varmeplan <noreply@varmeplan.no>";
const PUBLIC_BASE_URL = "https://varmeplan.no";
const MAKS_ALDER_MS = 30 * 60 * 1000;

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status, headers: { ...cors, "Content-Type": "application/json" },
  });
}

const esc = (s: unknown) =>
  String(s ?? "").replace(/[&<>"]/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]!));

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ ok: false, error: "POST kreves" }, 405);

  try {
    const body = await req.json().catch(() => ({}));
    const orgId = String(body?.org_id || "").trim();
    if (!UUID.test(orgId)) return json({ ok: false, error: "org_id kreves" }, 400);

    const db = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // ── Lag 1: en EKTE bruker ────────────────────────────────────────────────
    const auth = req.headers.get("Authorization") || "";
    const jwt = auth.startsWith("Bearer ") ? auth.slice(7) : "";
    if (!jwt) return json({ ok: false, error: "innlogging kreves" }, 401);
    const { data: userRes } = await db.auth.getUser(jwt);
    const kaller = userRes?.user;
    if (!kaller) return json({ ok: false, error: "innlogging kreves" }, 401);

    const avvis = (grunn: string) => {
      console.warn("kundesoknad-svar avvist:", grunn, "kaller", kaller.id, "org", orgId);
      return json({ ok: false, error: "E-posten kan ikke sendes for denne søknaden." }, 400);
    };

    // ── Søknaden ────────────────────────────────────────────────────────────
    const { data: org, error: orgErr } = await db.from("organizations")
      .select("id, name, org_type, requested_supplier_org_id, customer_request_decision, customer_request_decided_at, customer_request_reject_reason, customer_request_notified_at")
      .eq("id", orgId).maybeSingle();
    if (orgErr) { console.error("oppslag org:", orgErr.message); return json({ ok: false, error: "feil" }, 500); }
    if (!org) return avvis("org finnes ikke");
    if (org.org_type !== "installer") return avvis("ikke installatør");
    if (!org.requested_supplier_org_id) return avvis("ingen leverandør valgt");
    if (org.customer_request_decision !== "approved" && org.customer_request_decision !== "rejected") return avvis("ingen avgjørelse");
    const alder = Date.now() - new Date(org.customer_request_decided_at || 0).getTime();
    if (!(alder >= 0 && alder < MAKS_ALDER_MS)) return avvis("avgjørelsen er for gammel");
    if (org.customer_request_notified_at) return json({ ok: true, result: "allerede_sendt" });

    // ── Lag 2: kalleren tilhører leverandøren søkeren valgte ───────────────
    const { data: lev } = await db.from("organizations")
      .select("id, name, org_type").eq("id", org.requested_supplier_org_id).maybeSingle();
    if (!lev || lev.org_type !== "supplier") return avvis("leverandør ugyldig");
    const { data: medlem } = await db.from("organization_members")
      .select("user_id").eq("org_id", lev.id).eq("user_id", kaller.id).maybeSingle();
    if (!medlem) return avvis("kaller er ikke medlem av leverandøren");

    // ── Mottakeren: eieren av bedriften ────────────────────────────────────
    const { data: eier } = await db.from("organization_members")
      .select("user_id").eq("org_id", org.id).eq("role", "owner").limit(1).maybeSingle();
    if (!eier) return avvis("ingen eier");
    const { data: prof } = await db.from("profiles")
      .select("email, full_name").eq("id", eier.user_id).maybeSingle();
    const til = String(prof?.email || "").trim();
    if (!til) return avvis("eier uten e-post");

    const apiKey = Deno.env.get("RESEND_API_KEY");
    if (!apiKey) return json({ ok: false, error: "RESEND_API_KEY mangler" }, 500);

    // ── Én e-post per avgjørelse: reserver FØR sending ─────────────────────
    const { data: reservert } = await db.from("organizations")
      .update({ customer_request_notified_at: new Date().toISOString() })
      .eq("id", org.id).is("customer_request_notified_at", null).select("id");
    if (!reservert || !reservert.length) return json({ ok: true, result: "allerede_sendt" });

    const godkjent = org.customer_request_decision === "approved";
    const levNavn = lev.name || "leverandøren";
    const hilsen = prof?.full_name ? `Hei ${esc(prof.full_name)},` : "Hei,";
    const emne = godkjent
      ? `${org.name} har fått tilgang til Varmeplan`
      : `Søknaden om tilgang til Varmeplan`;
    const tekst = godkjent
      ? `<p style="color:#475569;font-size:14px;line-height:1.6;margin:0 0 8px 0">${esc(levNavn)} har godkjent søknaden for <strong>${esc(org.name)}</strong>. Du kan logge inn nå med e-postadressen og passordet du registrerte deg med.</p>`
      : `<p style="color:#475569;font-size:14px;line-height:1.6;margin:0 0 8px 0">${esc(levNavn)} har dessverre ikke godkjent søknaden for <strong>${esc(org.name)}</strong>.</p>` +
        (org.customer_request_reject_reason
          ? `<p style="color:#475569;font-size:14px;line-height:1.6;margin:0 0 8px 0">Begrunnelse: ${esc(org.customer_request_reject_reason)}</p>`
          : "") +
        `<p style="color:#475569;font-size:14px;line-height:1.6;margin:0">Har bedriften din allerede Varmeplan, kan administratoren i bedriften invitere deg. Ellers kan du ta kontakt med ${esc(levNavn)}.</p>`;
    const knapp = godkjent
      ? `<a href="${PUBLIC_BASE_URL}/" style="display:inline-block;background:#0891b2;color:#fff;text-decoration:none;padding:14px 32px;border-radius:8px;font-size:15px;font-weight:600">Logg inn</a>`
      : "";

    const emailRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        from: Deno.env.get("FROM_EMAIL") ?? FROM_DEFAULT,
        to: [til],
        subject: emne,
        html: `<meta charset="utf-8">
          <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:560px;margin:0 auto;padding:40px 24px">
            <h2 style="color:#0891b2;font-size:24px;margin-bottom:8px">Varmeplan</h2>
            <p style="color:#666;font-size:14px;margin-bottom:24px">Prosjektering av elektrisk varme</p>
            <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:24px;margin-bottom:24px">
              <p style="color:#1e293b;font-size:14px;margin:0 0 12px 0">${hilsen}</p>
              ${tekst}
            </div>
            ${knapp}
          </div>`,
      }),
    });

    if (!emailRes.ok) {
      console.error("Resend error:", await emailRes.text());
      // Frigi reservasjonen, så et nytt forsøk (innen 30 min) kan sende.
      await db.from("organizations").update({ customer_request_notified_at: null }).eq("id", org.id);
      return json({ ok: false, error: "Kunne ikke sende e-post" }, 500);
    }
    return json({ ok: true, result: "sendt", sent_to: til });

  } catch (err) {
    console.error("kundesoknad-svar:", err);
    return json({ ok: false, error: "feil" }, 500);
  }
});
