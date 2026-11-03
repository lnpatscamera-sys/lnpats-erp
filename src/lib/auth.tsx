import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { AuthChangeEvent, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type AppRole = Database["public"]["Enums"]["app_role"];

export const ROLE_LABELS: Record<AppRole, string> = {
  commandant: "Commandant",
  deputy_commandant: "Deputy Commandant",
  dc_admin: "Deputy Commissioner Admin",
  dc_academy: "Deputy Commissioner Academy",
  assistant_commissioner: "Assistant Commissioner",
  section_head: "Section Head",
  officer: "Officer",
  storekeeper: "Storekeeper",
  finance_officer: "Finance Officer",
  hr_officer: "HR Officer",
  hr_admin: "HR Administrator",
  finance_admin: "Finance Administrator",
  auditor: "Auditor",
  procurement_officer: "Procurement Officer",
  procurement_admin: "Procurement Administrator",
  registry_officer: "Registry Officer",
  ict_admin: "ICT Administrator",
  system_admin: "System Administrator",
  facility_manager: "Facility Manager",
  iss_officer: "ISS Officer",
  ict_officer: "ICT Officer",
  media_officer: "Media Officer",
  instructor: "Instructor",
};

type AuthCtx = { session: Session | null; roles: AppRole[]; loading: boolean; hasAny: (r: AppRole[]) => boolean };
const Ctx = createContext<AuthCtx>({ session: null, roles: [], loading: true, hasAny: () => false });

export function AuthProvider({ children, onIdentityChange }: { children: ReactNode; onIdentityChange?: (event: AuthChangeEvent) => void }) {
  const [session, setSession] = useState<Session | null>(null);
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    let identity: string | null | undefined;
    let revision = 0;
    const load = async (event: AuthChangeEvent, s: Session | null) => {
      if (!active) return;
      const nextIdentity = s?.user.id ?? null;
      const initialized = identity !== undefined;
      const changed = identity !== nextIdentity;
      identity = nextIdentity;
      setSession(s);
      if (!changed && event !== "USER_UPDATED") return;
      const currentRevision = ++revision;
      setRoles([]);
      setLoading(true);
      try {
        if (s) {
          const { data, error } = await supabase.from("user_roles").select("role").eq("user_id", s.user.id);
          if (active && revision === currentRevision) setRoles(error ? [] : (data ?? []).map((r) => r.role));
        }
      } finally {
        if (active && revision === currentRevision) setLoading(false);
      }
      if (active && revision === currentRevision && (initialized || event === "SIGNED_IN") && event !== "INITIAL_SESSION") {
        onIdentityChange?.(event);
      }
    };
    const { data: sub } = supabase.auth.onAuthStateChange((event, s) => {
      // Run database reads after the auth callback releases its session lock.
      setTimeout(() => { void load(event, s).catch(() => {}); }, 0);
    });
    return () => { active = false; sub.subscription.unsubscribe(); };
  }, [onIdentityChange]);

  const hasAny = (r: AppRole[]) => roles.includes("system_admin") || r.some((x) => roles.includes(x));
  return <Ctx.Provider value={{ session, roles, loading, hasAny }}>{children}</Ctx.Provider>;
}

export const useAuth = () => useContext(Ctx);
