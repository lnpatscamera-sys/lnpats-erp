import { useState } from "react";
import { isPersonalAccount } from '@/lib/officer-access';
import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { PageHeader } from "@/components/AppShell";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ictOptions } from "@/lib/ict";
import { phaseHead } from "@/lib/phase2";
import { ICTTickets } from "@/components/ICTTickets";
import { ICTRecords, type ICTKind } from "@/components/ICTRecords";
import { ICTAssets } from "@/components/ICTAssets";
import { ICTOverview, ICTReports } from "@/components/ICTOverview";
import { ICTContacts } from "@/components/ICTContacts";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Mail } from "lucide-react";
import { ICTOfficialEmailsModal } from "@/components/ICTOfficialEmailsModal";

export const Route = createFileRoute("/_authenticated/ict")({
  head: () =>
    phaseHead(
      "ICT Helpdesk",
      "LNPATS helpdesk tickets, service approvals, incidents, ICT assets, network records and IT reports.",
    ),
  loader: ({ context }) => context.queryClient.ensureQueryData(ictOptions),
  component: ICTPage,
});

function ICTPage() {
  const { data: d } = useSuspenseQuery(ictOptions);
  const { hasAny, roles } = useAuth();
  const [openEmailsModal, setOpenEmailsModal] = useState(false);
  const isSuperAdmin = hasAny(["system_admin", "ict_admin"]);

  if (isPersonalAccount(roles)) {
    return (
      <div>
        <PageHeader title="ICT Helpdesk" />
        <ICTTickets d={d} />
      </div>
    );
  }

  const contacts = hasAny(["ict_admin"]);
  const kinds: { id: ICTKind; label: string }[] = [
    { id: "requests", label: "Service requests" },
    { id: "incidents", label: "Incidents" },
    { id: "network", label: "Network" },
    { id: "accounts", label: "Accounts" },
    { id: "knowledge", label: "Knowledge base" },
  ];

  return (
    <div>
      <PageHeader
        title="ICT Helpdesk"
        actions={
          isSuperAdmin && (
            <Button
              onClick={() => setOpenEmailsModal(true)}
              className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium shadow-xs"
            >
              <Mail className="h-4 w-4" />
              Official Email Accounts
            </Button>
          )
        }
      />
      <Tabs defaultValue="dashboard" className="min-w-0">
        <div className="overflow-x-auto mb-5">
          <TabsList className="w-max">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="tickets">Tickets</TabsTrigger>
            {kinds.map((t) => (
              <TabsTrigger key={t.id} value={t.id}>
                {t.label}
              </TabsTrigger>
            ))}
            <TabsTrigger value="assets">ICT assets</TabsTrigger>
            <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
            {contacts && <TabsTrigger value="contacts">Staff contacts</TabsTrigger>}
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="dashboard">
          <ICTOverview d={d} />
        </TabsContent>
        <TabsContent value="tickets">
          <ICTTickets d={d} />
        </TabsContent>
        {kinds.map((t) => (
          <TabsContent value={t.id} key={t.id}>
            <ICTRecords d={d} kind={t.id} />
          </TabsContent>
        ))}
        <TabsContent value="assets">
          <ICTAssets d={d} />
        </TabsContent>
        <TabsContent value="maintenance">
          <ICTAssets d={d} maintenance />
        </TabsContent>
        {contacts && (
          <TabsContent value="contacts">
            <ICTContacts />
          </TabsContent>
        )}
        <TabsContent value="reports">
          <ICTReports d={d} />
        </TabsContent>
      </Tabs>

      <ICTOfficialEmailsModal open={openEmailsModal} onOpenChange={setOpenEmailsModal} />
    </div>
  );
}
