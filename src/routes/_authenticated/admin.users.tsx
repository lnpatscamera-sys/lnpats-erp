import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Mail } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/AppShell";
import { ROLE_LABELS, useAuth, type AppRole } from "@/lib/auth";
import { ICTOfficialEmailsModal } from "@/components/ICTOfficialEmailsModal";

export const Route = createFileRoute("/_authenticated/admin/users")({
  head: () => ({
    meta: [
      { title: "Users & Roles — LNPATS ERP" },
      { name: "description", content: "Manage authorized LNPATS staff roles and approval responsibilities." },
      { property: "og:title", content: "Users & Roles — LNPATS ERP" },
      { property: "og:description", content: "Manage authorized LNPATS staff roles and approval responsibilities." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Users,
});

function Users() {
  const { roles } = useAuth();
  const qc = useQueryClient();
  const [openEmailsModal, setOpenEmailsModal] = useState(false);

  const { data = [] } = useQuery({
    queryKey: ["users-roles"],
    queryFn: async () => (await supabase.rpc("list_users_with_roles")).data ?? [],
  });

  if (!roles.includes("system_admin")) {
    return <p className="text-muted-foreground">Only System Administrators can manage roles.</p>;
  }

  const set = async (uid: string, role: AppRole, grant: boolean) => {
    const { error } = await supabase.rpc("admin_set_role", { _user_id: uid, _role: role, _grant: grant });
    if (error) toast.error(error.message);
    else qc.invalidateQueries({ queryKey: ["users-roles"] });
  };

  const all = Object.keys(ROLE_LABELS) as AppRole[];

  return (
    <div>
      <PageHeader
        title="Users & Roles"
        subtitle="Assign what each staff member can see and approve"
        actions={
          <Button
            onClick={() => setOpenEmailsModal(true)}
            className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium shadow-xs"
          >
            <Mail className="h-4 w-4" />
            Official Email Accounts (Excel)
          </Button>
        }
      />

      <div className="space-y-3">
        {data.map((u) => (
          <Card key={u.id} className="p-4">
            <div className="font-medium">{u.full_name}</div>
            <div className="text-xs text-muted-foreground mb-3">{u.email}</div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {all.map((r) => (
                <label key={r} className="flex items-center gap-2 text-sm">
                  <Checkbox checked={u.roles.includes(r)} onCheckedChange={(c) => set(u.id, r, !!c)} /> {ROLE_LABELS[r]}
                </label>
              ))}
            </div>
          </Card>
        ))}
      </div>

      <ICTOfficialEmailsModal open={openEmailsModal} onOpenChange={setOpenEmailsModal} />
    </div>
  );
}
