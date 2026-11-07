import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Mail,
  Download,
  Search,
  Copy,
  Check,
  Building2,
  Users,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  RefreshCw,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { exportExcel } from '@/lib/export';
import { liberiaDate } from '@/lib/time';

interface ICTOfficialEmailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ICTOfficialEmailsModal({ open, onOpenChange }: ICTOfficialEmailsModalProps) {
  const [q, setQ] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'has_official' | 'has_account' | 'missing_official'>('all');
  const [deptFilter, setDeptFilter] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const {
    data: officers = [],
    isLoading,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ['ict-all-official-emails'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('officers')
        .select(
          'id, full_name, rank, position, designation, service_number, employee_number, form_number, official_email, email, phone, user_id, employment_status, offices!officers_office_id_fkey(name), sections!officers_section_id_fkey(name)'
        )
        .is('archived_at', null)
        .order('full_name');
      if (error) throw error;
      return data ?? [];
    },
    enabled: open,
  });

  // Extract unique departments for filter dropdown
  const departments = useMemo(() => {
    const set = new Set<string>();
    officers.forEach((o) => {
      if (o.offices?.name) set.add(o.offices.name);
    });
    return Array.from(set).sort();
  }, [officers]);

  // Filtered officers list
  const filteredOfficers = useMemo(() => {
    return officers.filter((o) => {
      const matchQ =
        !q ||
        o.full_name?.toLowerCase().includes(q.toLowerCase()) ||
        o.official_email?.toLowerCase().includes(q.toLowerCase()) ||
        o.email?.toLowerCase().includes(q.toLowerCase()) ||
        o.service_number?.toLowerCase().includes(q.toLowerCase()) ||
        o.employee_number?.toLowerCase().includes(q.toLowerCase()) ||
        o.form_number?.toLowerCase().includes(q.toLowerCase()) ||
        o.rank?.toLowerCase().includes(q.toLowerCase()) ||
        o.offices?.name?.toLowerCase().includes(q.toLowerCase());

      const matchType =
        filterType === 'all' ||
        (filterType === 'has_official' && !!o.official_email) ||
        (filterType === 'has_account' && !!o.user_id) ||
        (filterType === 'missing_official' && !o.official_email);

      const matchDept = deptFilter === 'all' || o.offices?.name === deptFilter;

      return matchQ && matchType && matchDept;
    });
  }, [officers, q, filterType, deptFilter]);

  // Statistics
  const totalCount = officers.length;
  const withOfficialEmailCount = officers.filter((o) => !!o.official_email).length;
  const withLoginAccountCount = officers.filter((o) => !!o.user_id).length;
  const missingOfficialEmailCount = officers.filter((o) => !o.official_email).length;

  const handleCopy = (email: string, id: string) => {
    navigator.clipboard.writeText(email);
    setCopiedId(id);
    toast.success(`Copied "${email}" to clipboard`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDownloadExcel = async () => {
    if (!filteredOfficers.length) {
      toast.error('No accounts match the current filter to export.');
      return;
    }

    const rows = filteredOfficers.map((o, idx) => ({
      'No.': idx + 1,
      'Officer Name': o.full_name,
      'Rank': o.rank || '—',
      'Position / Designation': o.position || o.designation || '—',
      'LNP / Service No.': o.service_number || '—',
      'Employee ID': o.employee_number || '—',
      'Staff File No.': o.form_number || '—',
      'Official Email Address': o.official_email || 'Not Assigned',
      'Personal Email Address': o.email || '—',
      'Mobile Phone': o.phone || '—',
      'Department (Office)': o.offices?.name || 'Unassigned',
      'Section / Unit': o.sections?.name || '—',
      'Login Account': o.user_id ? 'Active Login Account' : 'Personnel Record Only',
      'Employment Status': o.employment_status || 'Active',
    }));

    await exportExcel(`LNPATS-Official-Email-Accounts-${liberiaDate()}`, rows);
    toast.success(`Exported ${rows.length} official email account(s) to Excel`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] flex flex-col p-6 overflow-hidden">
        <DialogHeader className="space-y-1">
          <div className="flex items-center justify-between pr-6">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <Mail className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold">
                  Official Email Accounts Directory
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                  Complete directory of official staff emails for all LNPATS personnel and user accounts
                </DialogDescription>
              </div>
            </div>

            <Button
              onClick={handleDownloadExcel}
              disabled={isLoading || !filteredOfficers.length}
              className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium shadow-xs"
            >
              <FileSpreadsheet className="h-4 w-4" />
              Download Excel ({filteredOfficers.length})
            </Button>
          </div>
        </DialogHeader>

        {/* Quick KPI Stat Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-2">
          <div className="border rounded-lg p-3 bg-card/60">
            <span className="text-xs text-muted-foreground font-medium block">Total Personnel</span>
            <span className="text-xl font-bold mt-0.5 block">{totalCount}</span>
          </div>

          <div className="border rounded-lg p-3 bg-emerald-500/5 border-emerald-500/20">
            <span className="text-xs text-emerald-700 dark:text-emerald-400 font-medium block flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5" />
              With Official Email
            </span>
            <span className="text-xl font-bold text-emerald-700 dark:text-emerald-400 mt-0.5 block">
              {withOfficialEmailCount}
            </span>
          </div>

          <div className="border rounded-lg p-3 bg-primary/5 border-primary/20">
            <span className="text-xs text-primary font-medium block flex items-center gap-1">
              <Users className="h-3.5 w-3.5" />
              Active Login Accounts
            </span>
            <span className="text-xl font-bold text-primary mt-0.5 block">
              {withLoginAccountCount}
            </span>
          </div>

          <div className="border rounded-lg p-3 bg-amber-500/5 border-amber-500/20">
            <span className="text-xs text-amber-700 dark:text-amber-400 font-medium block flex items-center gap-1">
              <AlertCircle className="h-3.5 w-3.5" />
              Pending Official Email
            </span>
            <span className="text-xl font-bold text-amber-700 dark:text-amber-400 mt-0.5 block">
              {missingOfficialEmailCount}
            </span>
          </div>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 pb-3 border-b">
          <div className="flex flex-wrap items-center gap-2 flex-1 max-w-xl">
            <div className="relative flex-1 min-w-[220px]">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search name, official email, ID number, department…"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                className="pl-9 h-9 text-sm"
              />
            </div>

            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as never)}
              className="h-9 rounded-md border bg-background px-3 text-xs font-medium"
              aria-label="Filter account type"
            >
              <option value="all">All Accounts ({totalCount})</option>
              <option value="has_official">Has Official Email ({withOfficialEmailCount})</option>
              <option value="has_account">Has Login Account ({withLoginAccountCount})</option>
              <option value="missing_official">Missing Official Email ({missingOfficialEmailCount})</option>
            </select>

            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="h-9 rounded-md border bg-background px-3 text-xs font-medium"
              aria-label="Filter department"
            >
              <option value="all">All Departments</option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => refetch()}
              disabled={isFetching}
              className="h-8 gap-1 text-xs text-muted-foreground"
              title="Refresh records"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <span className="text-xs text-muted-foreground">
              Showing {filteredOfficers.length} of {totalCount} records
            </span>
          </div>
        </div>

        {/* Main Accounts Table */}
        <div className="flex-1 overflow-auto border rounded-lg mt-2 bg-card">
          <table className="w-full text-xs">
            <thead className="bg-muted/70 text-muted-foreground text-left sticky top-0 border-b font-medium uppercase tracking-wider z-10">
              <tr>
                <th className="p-2.5 w-10 text-center">#</th>
                <th className="p-2.5">Staff Name & Rank</th>
                <th className="p-2.5">ID / Service No.</th>
                <th className="p-2.5">Department</th>
                <th className="p-2.5">Official Email Address</th>
                <th className="p-2.5">Personal Email</th>
                <th className="p-2.5 text-center">Account Status</th>
                <th className="p-2.5 text-right w-20">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-muted-foreground">
                    <RefreshCw className="h-5 w-5 animate-spin mx-auto mb-2 text-primary" />
                    Loading official email accounts…
                  </td>
                </tr>
              ) : filteredOfficers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-muted-foreground">
                    No accounts found matching your search or filters.
                  </td>
                </tr>
              ) : (
                filteredOfficers.map((o, idx) => (
                  <tr key={o.id} className="hover:bg-muted/40 transition-colors">
                    <td className="p-2.5 text-center text-muted-foreground font-mono">
                      {idx + 1}
                    </td>
                    <td className="p-2.5 font-medium text-foreground">
                      <div className="font-semibold text-sm">{o.full_name}</div>
                      <div className="text-[11px] text-muted-foreground font-normal">
                        {o.rank} {o.position ? `· ${o.position}` : ''}
                      </div>
                    </td>
                    <td className="p-2.5 font-mono text-muted-foreground">
                      <div>{o.service_number}</div>
                      {o.employee_number && (
                        <div className="text-[10px] text-muted-foreground/75">
                          Emp: {o.employee_number}
                        </div>
                      )}
                    </td>
                    <td className="p-2.5">
                      <div className="inline-flex items-center gap-1 font-medium text-foreground">
                        <Building2 className="h-3 w-3 text-muted-foreground shrink-0" />
                        <span className="truncate max-w-[140px]">{o.offices?.name || 'General Staff'}</span>
                      </div>
                      {o.sections?.name && (
                        <div className="text-[10px] text-muted-foreground truncate max-w-[140px]">
                          {o.sections.name}
                        </div>
                      )}
                    </td>
                    <td className="p-2.5">
                      {o.official_email ? (
                        <div className="inline-flex items-center gap-1.5 font-mono text-xs font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/20">
                          <Mail className="h-3 w-3" />
                          <span>{o.official_email}</span>
                        </div>
                      ) : (
                        <Badge variant="outline" className="text-amber-600 border-amber-300 text-[10px]">
                          Not Assigned
                        </Badge>
                      )}
                    </td>
                    <td className="p-2.5 font-mono text-muted-foreground text-[11px]">
                      {o.email || '—'}
                    </td>
                    <td className="p-2.5 text-center">
                      {o.user_id ? (
                        <Badge
                          variant="default"
                          className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-semibold"
                        >
                          Login Active
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-[10px]">
                          No Login
                        </Badge>
                      )}
                    </td>
                    <td className="p-2.5 text-right">
                      {o.official_email ? (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleCopy(o.official_email!, o.id)}
                          className="h-7 px-2 text-xs gap-1"
                          title="Copy official email"
                        >
                          {copiedId === o.id ? (
                            <Check className="h-3.5 w-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="h-3.5 w-3.5" />
                          )}
                          <span className="text-[10px]">{copiedId === o.id ? 'Copied' : 'Copy'}</span>
                        </Button>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </DialogContent>
    </Dialog>
  );
}
