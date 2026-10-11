import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type OAuthResult = { data: any; error: { message: string } | null };
type OAuthApi = {
  getAuthorizationDetails: (id: string) => Promise<OAuthResult>;
  approveAuthorization: (id: string) => Promise<OAuthResult>;
  denyAuthorization: (id: string) => Promise<OAuthResult>;
};
const oauth = () => (supabase.auth as unknown as { oauth: OAuthApi }).oauth;

// Rendered inside ProtectedRoute: the login form shows in place, so the URL (authorization_id) is preserved.
export default function OAuthConsent() {
  const [params] = useSearchParams();
  const authorizationId = params.get("authorization_id") ?? "";
  const [details, setDetails] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      if (!authorizationId) return setError("authorization_id fehlt");
      try {
        const { data, error } = await oauth().getAuthorizationDetails(authorizationId);
        if (!active) return;
        if (error) return setError(error.message);
        const immediate = data?.redirect_url ?? data?.redirect_to;
        if (immediate && !data?.client) { window.location.href = immediate; return; }
        setDetails(data);
      } catch (e) {
        if (active) setError(e instanceof Error ? e.message : "Unbekannter Fehler");
      }
    })();
    return () => { active = false; };
  }, [authorizationId]);

  async function decide(approve: boolean) {
    setBusy(true);
    try {
      const { data, error } = approve
        ? await oauth().approveAuthorization(authorizationId)
        : await oauth().denyAuthorization(authorizationId);
      if (error) { setBusy(false); return setError(error.message); }
      const target = data?.redirect_url ?? data?.redirect_to;
      if (!target) { setBusy(false); return setError("Keine Weiterleitung vom Autorisierungsserver erhalten."); }
      window.location.href = target;
    } catch (e) {
      setBusy(false);
      setError(e instanceof Error ? e.message : "Unbekannter Fehler");
    }
  }

  const name = details?.client?.name ?? details?.client?.client_name ?? "eine App";

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        {error ? (
          <CardHeader>
            <CardTitle>Anfrage konnte nicht geladen werden</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
        ) : !details ? (
          <CardHeader><CardDescription>Lädt…</CardDescription></CardHeader>
        ) : (
          <>
            <CardHeader>
              <CardTitle>{name} mit deinem Konto verbinden?</CardTitle>
              <CardDescription>
                {name} kann dann in deinem Namen deine gespeicherten Chats lesen und die Wissensdatenbank durchsuchen.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex gap-2">
              <Button className="flex-1" disabled={busy} onClick={() => decide(true)}>Erlauben</Button>
              <Button className="flex-1" variant="outline" disabled={busy} onClick={() => decide(false)}>Ablehnen</Button>
            </CardContent>
          </>
        )}
      </Card>
    </div>
  );
}
