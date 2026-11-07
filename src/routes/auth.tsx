import { useServerFn } from "@tanstack/react-start";
import { looksLikeEmail } from "@/lib/enrollment";
import { requestPasswordReset, signInWithLnpId } from "@/lib/enrollment.functions";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { alignClockTo } from "@/lib/server-clock";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/Logo";
import { useAuth } from "@/lib/auth";
import campusBg from "@/assets/campus-background.jpg";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — LNPATS ERP" },
      { name: "description", content: "Staff sign in for the LNPATS management system." },
      { property: "og:title", content: "Sign in — LNPATS ERP" },
      { property: "og:description", content: "Staff sign in for the LNPATS management system." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const nav = useNavigate();
  const { session } = useAuth();
  const lnpSignIn = useServerFn(signInWithLnpId);
  const resetFn = useServerFn(requestPasswordReset);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (session) nav({ to: "/dashboard", replace: true });
  }, [session, nav]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (looksLikeEmail(username)) {
        const { error } = await supabase.auth.signInWithPassword({ email: username.trim(), password });
        if (error) toast.error(error.message);
        else { nav({ to: "/dashboard", replace: true }); }
      } else {
        const r = await lnpSignIn({ data: { lnpId: username, password } });
        if ("error" in r) toast.error(r.error);
        else {
          alignClockTo(r.server_now);
          const { error } = await supabase.auth.setSession({ access_token: r.access_token, refresh_token: r.refresh_token });
          if (error) toast.error(error.message);
          else { nav({ to: "/dashboard", replace: true }); }
        }
      }
    } catch { toast.error("Sign-in failed. Try again."); }
    setBusy(false);
  };

  const forgot = async () => {
    if (!username.trim()) { toast.error("Enter your LNP ID Number in User name first."); return; }
    setBusy(true);
    try {
      await resetFn({ data: { lnpId: username.trim(), origin: window.location.origin } });
      toast.success("If this LNP ID Number has an account, a password reset link has been sent to its email.");
    } catch { toast.error("Could not send the reset link. Try again."); }
    setBusy(false);
  };

  return (
    <div className="relative min-h-screen grid md:grid-cols-2 overflow-hidden bg-slate-950">
      {/* Full campus background photo covering the entire login screen */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${campusBg})` }}
      />
      {/* Light transparent scrim so the photo remains vibrant and clear without dark navy blue */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-black/15 to-black/45" />

      {/* Left panel: Logo and Title on transparent background */}
      <div className="relative z-10 hidden md:flex flex-col items-center justify-center p-10 text-center bg-transparent">
        <Logo className="h-40 w-40 ring-4 ring-gold shadow-2xl" />
        <h2 className="mt-6 text-3xl font-extrabold text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.95)]">
          LNPATS ERP
        </h2>
        <p className="mt-2 text-sm text-white/90 max-w-xs drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
          Liberia National Police Academy and Training School
        </p>
      </div>

      {/* Right panel: Staff sign-in form in a frosted transparent card */}
      <div className="relative z-10 flex items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-md rounded-2xl bg-white/90 dark:bg-slate-950/80 backdrop-blur-md p-8 border border-white/20 shadow-2xl">
          <form onSubmit={submit} className="w-full space-y-4">
            <div className="md:hidden flex justify-center mb-2">
              <Logo className="h-20 w-20 ring-2 ring-gold" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Staff sign in</h1>
            <div className="space-y-1">
              <Label htmlFor="auth-user">User name (LNP ID Number)</Label>
              <Input
                id="auth-user"
                required
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="bg-background/80"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="auth-pass">Password</Label>
              <Input
                id="auth-pass"
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-background/80"
              />
            </div>
            <Button className="w-full bg-primary hover:bg-primary/90 font-semibold" disabled={busy}>
              {busy ? "Signing in…" : "Sign in"}
            </Button>
            <button
              type="button"
              className="block w-full text-sm text-primary underline-offset-4 hover:underline"
              onClick={forgot}
            >
              Forgot password?
            </button>
            <p className="text-xs text-muted-foreground text-center">
              Accounts are opened by the Human Resources Section only. Contact HR if you do not have one.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
