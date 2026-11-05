import { useState, useMemo } from 'react';
import { Link } from '@tanstack/react-router';
import { AlertTriangle, CheckCircle, Search, FileSpreadsheet, FileText, Download, Building2, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import type { Directory, ReportSummary } from '@/lib/command';
import { exportExcel, exportPdf } from '@/lib/export';
import { exportCommandWord } from '@/lib/command';
import { reportAlertHour } from '@/lib/command-rules';

export function OutstandingReports({
  summary,
  directory,
}: {
  summary: ReportSummary;
  directory: Directory;
}) {
  const [q, setQ] = useState('');
  const [deptFilter, setDeptFilter] = useState('');

  // Map officer details from directory
  const enrichedMissing = useMemo(() => {
    return summary.missing.map((m) => {
      const full = directory.officers.find((o) => o.id === m.id);
      const officeId = full?.office_id;
      const sectionId = full?.section_id;
      const supervisorId = full?.supervisor_id;

      const office = directory.offices.find((o) => o.id === officeId)?.name ?? 'General Staff';
      const section = directory.sections.find((s) => s.id === sectionId)?.name ?? '—';
      const supervisor = directory.officers.find((s) => s.id === supervisorId)?.full_name ?? 'Not Assigned';

      return {
        id: m.id,
        name: m.name,
        employee_number: m.employee_number || 'No ID',
        office_id: officeId,
        department: office,
        section,
        supervisor,
        status: 'Outstanding',
        date: summary.date,
      };
    });
  }, [summary, directory]);

  // Filter missing reports
  const filtered = useMemo(() => {
    return enrichedMissing.filter((item) => {
      const matchQ =
        !q ||
        item.name.toLowerCase().includes(q.toLowerCase()) ||
        item.employee_number.toLowerCase().includes(q.toLowerCase()) ||
        item.department.toLowerCase().includes(q.toLowerCase());
      const matchDept = !deptFilter || item.office_id === deptFilter;
      return matchQ && matchDept;
    });
  }, [enrichedMissing, q, deptFilter]);

  const outstandingCount = summary.expected - summary.submitted;
  const complianceRate =
    summary.expected > 0 ? Math.round((summary.submitted / summary.expected) * 100) : 100;

  const currentHour = reportAlertHour(new Date());
  const isPastDeadline = currentHour !== null && Number(currentHour) >= 17;

  // Prepare export rows
  const exportRows = filtered.map((item, idx) => ({
    'No.': idx + 1,
    'Officer Name': item.name,
    'Employee / Service No.': item.employee_number,
    Department: item.department,
    Section: item.section,
    Supervisor: item.supervisor,
    'Reporting Date': item.date,
    Status: 'Report Not Submitted',
  }));

  const handleExportWord = async () => {
    await exportCommandWord(`LNPATS Outstanding Daily Reports - ${summary.date}`, exportRows);
  };

  return (
    <section className="space-y-6">
      {/* KPI & Summary Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border shadow-xs">
          <CardContent className="p-4">
            <span className="text-xs uppercase tracking-wide text-muted-foreground block">
              Expected Reporters
            </span>
            <div className="text-2xl font-bold mt-1">{summary.expected}</div>
            <p className="text-xs text-muted-foreground mt-0.5">Active personnel scheduled</p>
          </CardContent>
        </Card>

        <Card className="border shadow-xs">
          <CardContent className="p-4">
            <span className="text-xs uppercase tracking-wide text-muted-foreground block">
              Reports Submitted
            </span>
            <div className="text-2xl font-bold mt-1 text-emerald-600 dark:text-emerald-400">
              {summary.submitted}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">{complianceRate}% submission rate</p>
          </CardContent>
        </Card>

        <Card className="border border-destructive/30 bg-destructive/5 shadow-xs">
          <CardContent className="p-4">
            <span className="text-xs uppercase tracking-wide text-destructive font-medium block flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
              Outstanding Reports
            </span>
            <div className="text-2xl font-bold mt-1 text-destructive">{outstandingCount}</div>
            <p className="text-xs text-destructive/80 mt-0.5">Pending daily submissions</p>
          </CardContent>
        </Card>

        <Card className="border shadow-xs">
          <CardContent className="p-4">
            <span className="text-xs uppercase tracking-wide text-muted-foreground block">
              Reporting Date
            </span>
            <div className="text-2xl font-bold mt-1 font-mono">{summary.date}</div>
            <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {isPastDeadline ? 'Past 17:00 deadline' : 'Active reporting day'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Advisory Alert Banner */}
      {outstandingCount > 0 ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-destructive flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 mt-0.5 shrink-0" />
          <div className="space-y-1">
            <h4 className="font-semibold text-sm">
              Daily Reporting Delinquency Notice — {outstandingCount} Officer(s) Outstanding
            </h4>
            <p className="text-xs leading-relaxed text-destructive/90">
              In accordance with LNPATS Academy standard operating procedures, daily reports must be
              submitted by assigned personnel for supervisory oversight and headquarters compilation.
              {isPastDeadline && ' Official 17:00 submission deadline has elapsed.'}
            </p>
          </div>
        </div>
      ) : (
        <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4 text-emerald-800 dark:text-emerald-300 flex items-center gap-3">
          <CheckCircle className="h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
          <div>
            <h4 className="font-semibold text-sm">Full Reporting Compliance Achieved</h4>
            <p className="text-xs">
              All {summary.expected} expected reporting personnel have submitted their daily activity
              reports for {summary.date}.
            </p>
          </div>
        </div>
      )}

      {/* Filters and Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 flex-1 max-w-xl">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search officer name or ID number…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="pl-9 h-9 text-sm"
            />
          </div>

          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="h-9 rounded-md border bg-background px-3 text-sm"
            aria-label="Filter by department"
          >
            <option value="">All Departments</option>
            {directory.offices.map((off) => (
              <option key={off.id} value={off.id}>
                {off.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => exportPdf(`LNPATS Outstanding Reports - ${summary.date}`, exportRows)}
            disabled={!filtered.length}
            className="gap-1.5"
          >
            <FileText className="h-4 w-4" />
            PDF
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              exportExcel(`lnpats-outstanding-reports-${summary.date}`, exportRows)
            }
            disabled={!filtered.length}
            className="gap-1.5"
          >
            <FileSpreadsheet className="h-4 w-4" />
            Excel
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleExportWord}
            disabled={!filtered.length}
            className="gap-1.5"
          >
            <Download className="h-4 w-4" />
            Word (.docx)
          </Button>
        </div>
      </div>

      {/* Roster of Officers with Outstanding Reports */}
      <div className="border rounded-lg overflow-hidden bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/60 text-muted-foreground text-left border-b font-medium text-xs uppercase tracking-wider">
              <tr>
                <th className="p-3 w-12 text-center">#</th>
                <th className="p-3">Officer Name</th>
                <th className="p-3">ID / Service No.</th>
                <th className="p-3">Department</th>
                <th className="p-3">Section / Unit</th>
                <th className="p-3">Direct Supervisor</th>
                <th className="p-3 text-center">Report Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-muted-foreground">
                    {summary.missing.length === 0 ? (
                      <div className="space-y-1">
                        <CheckCircle className="h-8 w-8 text-emerald-500 mx-auto mb-1" />
                        <p className="font-semibold text-foreground">No Outstanding Reports</p>
                        <p className="text-xs">
                          All expected officers have submitted their reports for this date.
                        </p>
                      </div>
                    ) : (
                      'No outstanding reports match the selected filters.'
                    )}
                  </td>
                </tr>
              ) : (
                filtered.map((item, index) => (
                  <tr key={item.id} className="hover:bg-muted/40 transition-colors">
                    <td className="p-3 text-center text-xs text-muted-foreground font-mono">
                      {index + 1}
                    </td>
                    <td className="p-3 font-semibold text-foreground">
                      {item.name}
                    </td>
                    <td className="p-3 font-mono text-xs text-muted-foreground">
                      {item.employee_number}
                    </td>
                    <td className="p-3 flex-wrap">
                      <span className="inline-flex items-center gap-1 text-xs">
                        <Building2 className="h-3 w-3 text-muted-foreground" />
                        {item.department}
                      </span>
                    </td>
                    <td className="p-3 text-xs text-muted-foreground">
                      {item.section}
                    </td>
                    <td className="p-3 text-xs">
                      {item.supervisor}
                    </td>
                    <td className="p-3 text-center">
                      <Badge
                        variant="destructive"
                        className="text-[10px] font-semibold uppercase tracking-wider"
                      >
                        Pending Report
                      </Badge>
                    </td>
                    <td className="p-3 text-right">
                      <Button asChild size="sm" variant="ghost" className="h-8 text-xs">
                        <Link to="/officers/$id" params={{ id: item.id }}>
                          View Officer
                        </Link>
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
