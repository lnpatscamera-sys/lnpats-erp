import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { isPersonalAccount } from '@/lib/officer-access';
import { createFileRoute, useLocation } from '@tanstack/react-router';
import { useSuspenseQuery } from '@tanstack/react-query';
import { PageHeader } from '@/components/AppShell';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { commandOptions } from '@/lib/command';
import { DailyReports } from '@/components/DailyReports';
import { CommandCompilations } from '@/components/CommandCompilations';
import { CommandAssignments } from '@/components/CommandAssignments';
import { Appointments } from '@/components/Appointments';
import { OutstandingReports } from '@/components/OutstandingReports';

export const Route = createFileRoute('/_authenticated/command')({
  head: () => ({
    meta: [
      { title: 'Command Chain & Daily Reports — LNPATS ERP' },
      { name: 'description', content: 'LNPATS daily activity reports, command reviews and consolidated headquarters reports.' },
      { property: 'og:title', content: 'Command Chain & Daily Reports — LNPATS ERP' },
      { property: 'og:description', content: 'Daily activity reporting and named command oversight for LNPATS.' },
      { property: 'og:type', content: 'website' },
      { name: 'twitter:card', content: 'summary' },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(commandOptions),
  component: Command,
});

function Command() {
  const { data } = useSuspenseQuery(commandOptions);
  const { roles } = useAuth();
  const location = useLocation();

  const validTabs = ['reports', 'outstanding', 'compile', 'lines', 'appointments'];
  const searchTab = new URLSearchParams(location.searchStr).get('tab');
  const [activeTab, setActiveTab] = useState(() =>
    searchTab && validTabs.includes(searchTab) ? searchTab : 'reports'
  );

  useEffect(() => {
    if (searchTab && validTabs.includes(searchTab) && searchTab !== activeTab) {
      setActiveTab(searchTab);
    }
  }, [searchTab, activeTab]);

  const handleTabChange = (val: string) => {
    setActiveTab(val);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('tab', val);
      window.history.replaceState({}, '', url.toString());
    }
  };

  if (isPersonalAccount(roles)) {
    return (
      <div>
        <PageHeader title="Daily Reports" />
        <DailyReports reports={data.reports} directory={data.directory} />
      </div>
    );
  }

  const s = data.summary;
  const outstandingCount = s.expected - s.submitted;

  const kpis: [string, number | string, string | null][] = [
    ['Expected reporters', s.expected, 'reports'],
    ['Reports submitted', s.submitted, 'reports'],
    ['Outstanding reports', outstandingCount, 'outstanding'],
    ['Reporting date', s.date, null],
  ];

  return (
    <div>
      <PageHeader title="Command Chain & Daily Reports" />

      {/* Interactive Command KPI Summary Header */}
      <div className="grid grid-cols-2 sm:grid-cols-4 border-y divide-x py-4 mb-6">
        {kpis.map(([k, v, targetTab]) => (
          <div
            key={k}
            onClick={() => targetTab && handleTabChange(targetTab)}
            className={`px-3 ${
              targetTab
                ? 'cursor-pointer hover:bg-muted/60 transition-colors rounded group'
                : ''
            }`}
            role={targetTab ? 'button' : undefined}
            tabIndex={targetTab ? 0 : undefined}
            onKeyDown={(e) => {
              if (targetTab && (e.key === 'Enter' || e.key === ' ')) {
                handleTabChange(targetTab);
              }
            }}
          >
            <p className="text-xs text-muted-foreground flex items-center justify-between">
              <span>{k}</span>
              {targetTab === 'outstanding' && Number(v) > 0 && (
                <span className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
              )}
            </p>
            <p
              className={`text-xl font-semibold break-words mt-0.5 ${
                targetTab === 'outstanding' && Number(v) > 0 ? 'text-destructive' : ''
              }`}
            >
              {v}
            </p>
            {targetTab && (
              <span className="text-[11px] text-primary group-hover:underline block mt-0.5 font-medium">
                View {k.toLowerCase()} →
              </span>
            )}
          </div>
        ))}
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="mb-5 flex-wrap h-auto gap-1">
          <TabsTrigger value="reports">Daily Reports</TabsTrigger>
          <TabsTrigger value="outstanding" className="relative gap-1.5">
            Outstanding Reports
            {outstandingCount > 0 && (
              <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-destructive text-destructive-foreground">
                {outstandingCount}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="compile">Compiled Reports</TabsTrigger>
          <TabsTrigger value="lines">Reporting Lines</TabsTrigger>
          <TabsTrigger value="appointments">Appointment Approvals</TabsTrigger>
        </TabsList>

        <TabsContent value="reports">
          <DailyReports reports={data.reports} directory={data.directory} />
        </TabsContent>

        <TabsContent value="outstanding">
          <OutstandingReports summary={data.summary} directory={data.directory} />
        </TabsContent>

        <TabsContent value="compile">
          <CommandCompilations reports={data.reports} compilations={data.compilations} summary={data.summary} />
        </TabsContent>

        <TabsContent value="lines">
          <CommandAssignments directory={data.directory} />
        </TabsContent>

        <TabsContent value="appointments">
          <Appointments mode="command" />
        </TabsContent>
      </Tabs>
    </div>
  );
}
