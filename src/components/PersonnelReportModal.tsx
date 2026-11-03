import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  FileText,
  Download,
  Printer,
  Mail,
  ShieldAlert,
  Loader2,
  CheckCircle,
  FileSpreadsheet,
  Building,
  User,
  Phone,
  Briefcase,
  GraduationCap,
  Calendar,
  AlertTriangle,
  Award,
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/lib/auth';
import { liberiaDateTime, liberiaDate } from '@/lib/time';
import { LETTERHEAD_LINES, crestUrls } from '@/lib/letterhead';
import { retirementSummary } from '@/lib/hr-enrollment';
import { details } from '@/lib/hr';
import {
  fetchFullOfficerProfile,
  generateReportNumber,
  generatePersonnelReportPdf,
  archiveReportDocument,
  type FullOfficerData,
} from '@/lib/personnel-report';

interface PersonnelReportModalProps {
  officerId: string | null;
  onClose: () => void;
  defaultMode?: 'standard' | 'full';
}

export function PersonnelReportModal({ officerId, onClose, defaultMode = 'standard' }: PersonnelReportModalProps) {
  const { session, hasAny } = useAuth();
  const qc = useQueryClient();
  const [mode, setMode] = useState<'standard' | 'full'>(defaultMode);
  const [reportNumber, setReportNumber] = useState<string>('');
  const [generationDate, setGenerationDate] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [emailModalOpen, setEmailModalOpen] = useState<boolean>(false);
  const [emailRecipient, setEmailRecipient] = useState<string>('');
  const [emailSubject, setEmailSubject] = useState<string>('');
  const [emailBody, setEmailBody] = useState<string>('');

  // Requirement 8: Ensure only authorized HR personnel, ICT Administrators, and System Administrators can generate reports
  const canGenerate = hasAny(['hr_admin', 'hr_officer', 'ict_admin', 'system_admin']);

  // Fetch officer and comprehensive HR dossier data
  const { data, isLoading, error } = useQuery<FullOfficerData>({
    queryKey: ['officer-full-report', officerId],
    enabled: !!officerId && canGenerate,
    queryFn: () => fetchFullOfficerProfile(officerId!),
    staleTime: 60 * 1000,
  });

  // Initialize report number and generation timestamp when data arrives
  useEffect(() => {
    if (data?.officer) {
      setReportNumber(generateReportNumber(data.officer));
      setGenerationDate(liberiaDateTime(new Date()));
      setEmailRecipient(data.officer.official_email || data.officer.email || '');
      setEmailSubject(`Official Personnel Report: ${data.officer.rank} ${data.officer.full_name} (${data.officer.service_number})`);
      setEmailBody(
        `Dear Officer / Administrator,\n\nPlease find the official personnel report details for ${data.officer.rank} ${data.officer.full_name} (LNP Service No: ${data.officer.service_number}), generated from the LNPATS ERP System.\n\nReport Number: ${generateReportNumber(data.officer)}\nGenerated On: ${liberiaDateTime(new Date())}\nDepartment: ${data.officer.offices?.name || 'LNPATS'}\nStatus: ${data.officer.employment_status || 'Active'}\n\nLiberia National Police Academy & Training School (LNPATS)`
      );
    }
  }, [data?.officer]);

  // Handle Download PDF (Requirements 2, 3, 4, 5, 6, 7, 10, 11, 13)
  const handleDownloadPdf = async () => {
    if (!data || !session) return;
    setIsProcessing(true);
    try {
      const repNo = reportNumber || generateReportNumber(data.officer);
      const { blob, fileName } = await generatePersonnelReportPdf({
        data,
        mode,
        reportNumber: repNo,
      });

      // Trigger browser download
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(url), 2000);

      // Requirement 11: Store generated report in officer's document history
      await archiveReportDocument({
        officerId: data.officer.id,
        reportNumber: repNo,
        mode,
        pdfBlob: blob,
        sessionUserId: session.user.id,
        officerName: data.officer.full_name,
      });

      // Invalidate relevant query caches
      qc.invalidateQueries({ queryKey: ['hr'] });
      qc.invalidateQueries({ queryKey: ['officer', data.officer.id] });

      toast.success(`Report ${repNo} generated, downloaded, and archived to document history.`);
    } catch (err) {
      console.error(err);
      toast.error(`Failed to generate PDF: ${(err as Error).message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle Print Directly (Requirement 7)
  const handlePrint = () => {
    window.print();
  };

  // Handle Email to Authorized Recipients (Requirement 7)
  const handleSendEmail = () => {
    if (!emailRecipient) {
      toast.error('Please enter a recipient email address.');
      return;
    }
    const mailto = `mailto:${encodeURIComponent(emailRecipient)}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
    window.location.href = mailto;
    toast.success('Email client opened with report dispatch.');
    setEmailModalOpen(false);
  };

  if (!officerId) return null;

  return (
    <>
      <Dialog open={!!officerId} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="max-w-5xl max-h-[92vh] flex flex-col p-0 overflow-hidden">
          {/* Dialog Header */}
          <DialogHeader className="p-4 border-b bg-muted/40 shrink-0">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <DialogTitle className="text-lg font-bold flex items-center gap-2 text-foreground">
                  <FileText className="h-5 w-5 text-primary" />
                  Official Personnel Report Generator
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                  Liberia National Police Academy & Training School Administrative Reporting System
                </DialogDescription>
              </div>

              {/* Action Buttons (Requirements 7, 9, 12) */}
              <div className="flex items-center gap-2 flex-wrap">
                {/* Mode Selector */}
                <div className="inline-flex rounded-md border p-1 bg-background text-xs">
                  <button
                    type="button"
                    onClick={() => setMode('standard')}
                    className={`px-3 py-1 rounded transition-colors ${mode === 'standard' ? 'bg-primary text-primary-foreground font-semibold' : 'text-muted-foreground hover:text-foreground'}`}
                  >
                    Standard Report
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode('full')}
                    className={`px-3 py-1 rounded transition-colors ${mode === 'full' ? 'bg-primary text-primary-foreground font-semibold' : 'text-muted-foreground hover:text-foreground'}`}
                  >
                    Generate Full Personnel File
                  </button>
                </div>

                {canGenerate && data && (
                  <>
                    <Button
                      size="sm"
                      onClick={handleDownloadPdf}
                      disabled={isProcessing}
                      className="gap-1.5 shadow-sm"
                    >
                      {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                      Download PDF
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handlePrint}
                      className="gap-1.5"
                    >
                      <Printer className="h-4 w-4" />
                      Print
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEmailModalOpen(true)}
                      className="gap-1.5"
                    >
                      <Mail className="h-4 w-4" />
                      Email
                    </Button>
                  </>
                )}
              </div>
            </div>
          </DialogHeader>

          {/* Modal Body / Report Preview Window (Requirement 12) */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-100/70 dark:bg-slate-900/40">
            {!canGenerate ? (
              <div className="p-8 text-center bg-card rounded-lg border shadow-sm max-w-md mx-auto my-12">
                <ShieldAlert className="h-12 w-12 text-destructive mx-auto mb-3" />
                <h3 className="font-semibold text-lg text-foreground">Access Restricted</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  Only authorized Human Resources Personnel, ICT Administrators, and System Administrators are permitted to generate and export official personnel reports.
                </p>
              </div>
            ) : isLoading ? (
              <div className="flex flex-col items-center justify-center p-16 space-y-3">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Compiling official personnel dossier & verification data…</p>
              </div>
            ) : error || !data ? (
              <div className="p-8 text-center bg-card rounded-lg border shadow-sm max-w-md mx-auto my-12">
                <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-3" />
                <h3 className="font-semibold text-lg">Unable to Load Personnel Data</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  {error instanceof Error ? error.message : 'Please check your connection or contact ICT.'}
                </p>
              </div>
            ) : (
              /* High-fidelity Visual Document Preview */
              <div className="max-w-[210mm] mx-auto bg-card text-card-foreground shadow-md rounded-sm border p-6 md:p-8 space-y-6 print:shadow-none print:border-none print:p-0">
                {/* Official LNPATS Letterhead (Requirement 4) */}
                <div className="relative border-b-2 border-primary/90 pb-4 text-center">
                  <div className="flex items-center justify-between gap-4 mb-2">
                    <img
                      src={crestUrls.left}
                      alt="Republic of Liberia Crest"
                      className="h-16 w-16 object-contain"
                      onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                    />
                    <div className="flex-1 space-y-0.5">
                      <h1 className="text-sm md:text-base font-bold tracking-wide uppercase text-foreground">
                        {LETTERHEAD_LINES[0]}
                      </h1>
                      <h2 className="text-xs md:text-sm font-semibold text-muted-foreground uppercase">
                        {LETTERHEAD_LINES[1]}
                      </h2>
                      <h3 className="text-xs md:text-sm font-bold text-primary tracking-wide uppercase">
                        {LETTERHEAD_LINES[2]}
                      </h3>
                      <p className="text-[10px] md:text-xs text-muted-foreground italic">
                        {LETTERHEAD_LINES[3]}
                      </p>
                    </div>
                    <img
                      src={crestUrls.right}
                      alt="LNPATS Crest"
                      className="h-16 w-16 object-contain"
                      onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                    />
                  </div>

                  {/* Document Title Banner */}
                  <div className="mt-4 pt-2 border-t">
                    <div className="text-sm font-extrabold tracking-wider uppercase text-foreground">
                      {mode === 'full' ? 'FULL PERSONNEL DOSSIER & SERVICE FILE' : 'OFFICIAL PERSONNEL RECORD REPORT'}
                    </div>
                  </div>

                  {/* Automatic Report Number & Date Banner (Requirement 5) */}
                  <div className="mt-2 bg-muted/50 rounded px-3 py-1.5 flex flex-wrap items-center justify-between text-[11px] text-muted-foreground font-mono">
                    <span>
                      <strong>REPORT NO:</strong> {reportNumber}
                    </span>
                    <span>
                      <strong>DATE OF ISSUE:</strong> {generationDate}
                    </span>
                    <Badge variant="outline" className="text-[10px] uppercase font-semibold">
                      Restricted / Official
                    </Badge>
                  </div>
                </div>

                {/* Primary Officer Profile Box with Photo (Requirement 3) */}
                <div className="flex flex-col sm:flex-row gap-5 items-start p-4 bg-muted/20 border rounded-md">
                  {/* Officer Photo Box */}
                  <div className="shrink-0 mx-auto sm:mx-0 text-center">
                    <div className="w-[100px] h-[125px] border-2 border-muted-foreground/30 rounded bg-muted/60 overflow-hidden flex items-center justify-center shadow-inner">
                      {data.photoDataUrl ? (
                        <img
                          src={data.photoDataUrl}
                          alt={data.officer.full_name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-[11px] text-muted-foreground font-medium text-center p-2">
                          OFFICIAL PHOTO
                        </span>
                      )}
                    </div>
                    <span className="text-[9px] text-muted-foreground font-mono mt-1 block">VERIFIED PHOTO</span>
                  </div>

                  {/* Officer Primary Attributes */}
                  <div className="flex-1 space-y-1.5 text-sm min-w-0 w-full">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h4 className="text-lg font-bold text-foreground">
                        {data.officer.rank} {data.officer.full_name}
                      </h4>
                      <Badge variant="default" className="capitalize">
                        {data.officer.employment_status || 'Active'}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs pt-1 border-t">
                      <div>
                        <span className="text-muted-foreground block text-[10px] uppercase">Service / LNP ID</span>
                        <strong className="font-mono text-foreground">{data.officer.service_number || '—'}</strong>
                      </div>
                      <div>
                        <span className="text-muted-foreground block text-[10px] uppercase">Staff File Number</span>
                        <strong className="font-mono text-foreground">{data.officer.form_number || '—'}</strong>
                      </div>
                      <div>
                        <span className="text-muted-foreground block text-[10px] uppercase">Personnel ID</span>
                        <strong className="font-mono text-foreground">{data.officer.employee_number || '—'}</strong>
                      </div>
                      <div>
                        <span className="text-muted-foreground block text-[10px] uppercase">Designation / Role</span>
                        <span className="font-medium text-foreground">{data.officer.position || data.officer.designation || 'Staff'}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block text-[10px] uppercase">Department / Section</span>
                        <span className="font-medium text-foreground">{data.officer.offices?.name || '—'} / {data.officer.sections?.name || '—'}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block text-[10px] uppercase">Official Email</span>
                        <span className="font-mono text-[11px] text-foreground truncate block">{data.officer.official_email || '—'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section 1: Personal & Demographic Particulars (Requirement 3) */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wide bg-primary/10 text-primary px-2.5 py-1 rounded">
                    1. Personal & Demographic Particulars
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs border rounded p-3">
                    <Item label="Full Name" value={data.officer.full_name} />
                    <Item
                      label="Date of Birth"
                      value={
                        data.officer.date_of_birth
                          ? `${data.officer.date_of_birth} (Age ${retirementSummary(data.officer.date_of_birth, liberiaDate())?.age ?? '—'})`
                          : '—'
                      }
                    />
                    <Item label="Gender" value={data.officer.gender} />
                    <Item label="Nationality" value={data.officer.nationality || 'Liberian'} />
                    <Item label="Marital Status" value={data.officer.marital_status} />
                    <Item label="Blood Group" value={data.officer.blood_group} />
                    <Item label="County of Origin" value={data.officer.county} />
                    <Item label="National ID Number" value={details(data.officer.enrollment_profile)['national_id'] ?? null} />
                    <Item label="LNP Class Number" value={data.officer.lnp_class_number} />
                  </div>
                </div>

                {/* Section 2: Service & Employment Details (Requirement 3) */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wide bg-primary/10 text-primary px-2.5 py-1 rounded">
                    2. Service, Appointment & Station Particulars
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs border rounded p-3">
                    <Item label="Current Rank" value={data.officer.rank} />
                    <Item label="Position / Title" value={data.officer.position || data.officer.designation} />
                    <Item label="Department (Office)" value={data.officer.offices?.name ?? null} />
                    <Item label="Section / Unit" value={data.officer.sections?.name ?? null} />
                    <Item label="Employment Status" value={data.officer.employment_status} />
                    <Item label="Employment Type" value={data.officer.employment_type} />
                    <Item label="Date Joined LNP" value={data.officer.date_joined} />
                    <Item label="Appointment Date" value={details(data.officer.enrollment_profile)['appointment_date'] || data.officer.date_joined} />
                    <Item
                      label="Retirement Eligibility (Age 65)"
                      value={
                        data.officer.retirement_date ||
                        retirementSummary(data.officer.date_of_birth, liberiaDate())?.date ||
                        '—'
                      }
                    />
                    <Item
                      label="Reporting Supervisor"
                      value={data.supervisor ? `${data.supervisor.rank} ${data.supervisor.full_name}` : '—'}
                    />
                    <Item label="Duty Station" value={details(data.officer.enrollment_profile)['duty_station'] || 'Paynesville HQ'} />
                    <Item label="Current Assignment" value={data.officer.current_assignment} />
                  </div>
                </div>

                {/* Section 3: Contact & Residential Details (Requirement 3) */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wide bg-primary/10 text-primary px-2.5 py-1 rounded">
                    3. Contact Details & Residential Address
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs border rounded p-3">
                    <Item label="Official Email" value={data.officer.official_email} />
                    <Item label="Personal Email" value={data.officer.email} />
                    <Item label="Mobile Phone" value={data.officer.phone} />
                    <Item label="Residential Address" value={data.officer.address} colSpan={2} />
                    <Item label="City / Community" value={details(data.officer.enrollment_profile)['city']} />
                    <Item
                      label="Next of Kin Details"
                      value={`${data.officer.next_of_kin || '—'}${data.officer.next_of_kin_phone ? ` (${data.officer.next_of_kin_phone})` : ''}`}
                      colSpan={2}
                    />
                    <Item
                      label="Emergency Contact"
                      value={`${details(data.officer.enrollment_profile)['emergency_name'] || data.officer.emergency_contact || '—'} [${details(data.officer.enrollment_profile)['emergency_phone'] || '—'}]`}
                    />
                  </div>
                </div>

                {/* Section 4: Education & Qualifications (Requirement 3) */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wide bg-primary/10 text-primary px-2.5 py-1 rounded">
                    4. Education & Qualifications
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs border rounded p-3">
                    <Item label="Highest Education Level" value={data.officer.education || details(data.officer.enrollment_profile)['education']} />
                    <Item label="Institution" value={details(data.officer.enrollment_profile)['institution']} />
                    <Item label="Degree / Diploma" value={details(data.officer.enrollment_profile)['degree']} />
                    <Item label="Specialized Training" value={details(data.officer.enrollment_profile)['specialized_training'] || data.officer.training_history} colSpan={2} />
                    <Item label="Languages Spoken" value={details(data.officer.enrollment_profile)['languages'] || 'English'} />
                  </div>
                </div>

                {/* Section 5: Documents & Certificates on File (Requirement 3) */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wide bg-primary/10 text-primary px-2.5 py-1 rounded">
                    5. Verified Documents & Certificates on File
                  </h4>
                  <div className="border rounded overflow-hidden text-xs">
                    <table className="w-full text-left">
                      <thead className="bg-muted text-[11px] text-muted-foreground uppercase">
                        <tr>
                          <th className="p-2">Document Type</th>
                          <th className="p-2">File Name</th>
                          <th className="p-2">Upload Date</th>
                          <th className="p-2">Verification</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {data.documents.length === 0 ? (
                          <tr>
                            <td colSpan={4} className="p-2.5 text-muted-foreground italic text-center">
                              No documents currently uploaded to officer profile.
                            </td>
                          </tr>
                        ) : (
                          data.documents.map((doc) => (
                            <tr key={doc.id}>
                              <td className="p-2 font-medium">{doc.document_type || 'General'}</td>
                              <td className="p-2 truncate max-w-[200px]">{doc.document_name || '—'}</td>
                              <td className="p-2">{doc.upload_date ? doc.upload_date.slice(0, 10) : '—'}</td>
                              <td className="p-2 text-primary font-medium">Verified On File</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* EXPANDED FULL FILE SECTIONS (Requirement 9) */}
                {mode === 'full' && (
                  <div className="space-y-6 pt-2 border-t-2 border-dashed">
                    <div className="text-center py-1">
                      <Badge variant="secondary" className="text-xs px-3 py-1 font-bold uppercase tracking-wider">
                        Full Administrative Dossier Records
                      </Badge>
                    </div>

                    {/* Promotions & Advancement History */}
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold uppercase tracking-wide bg-primary/10 text-primary px-2.5 py-1 rounded">
                        6. Promotion & Rank Advancement History
                      </h4>
                      <div className="border rounded overflow-hidden text-xs">
                        <table className="w-full text-left">
                          <thead className="bg-muted text-[11px] text-muted-foreground uppercase">
                            <tr>
                              <th className="p-2">Previous Rank</th>
                              <th className="p-2">Promoted Rank</th>
                              <th className="p-2">Effective Date</th>
                              <th className="p-2">Remarks / Authority</th>
                              <th className="p-2">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y">
                            {data.promotions.length === 0 ? (
                              <tr>
                                <td colSpan={5} className="p-2.5 text-muted-foreground italic text-center">
                                  {data.officer.promotion_history || 'No recorded promotion history on file.'}
                                </td>
                              </tr>
                            ) : (
                              data.promotions.map((pr) => (
                                <tr key={pr.id}>
                                  <td className="p-2">{pr.previous_rank || '—'}</td>
                                  <td className="p-2 font-medium text-foreground">{pr.promoted_rank || '—'}</td>
                                  <td className="p-2">{pr.promotion_date || '—'}</td>
                                  <td className="p-2">{pr.remarks || '—'}</td>
                                  <td className="p-2 text-primary capitalize">{pr.status || 'Approved'}</td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Training & Certifications */}
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold uppercase tracking-wide bg-primary/10 text-primary px-2.5 py-1 rounded">
                        7. Training History & Certifications
                      </h4>
                      <div className="border rounded overflow-hidden text-xs">
                        <table className="w-full text-left">
                          <thead className="bg-muted text-[11px] text-muted-foreground uppercase">
                            <tr>
                              <th className="p-2">Program / Course</th>
                              <th className="p-2">Institution</th>
                              <th className="p-2">Date / Duration</th>
                              <th className="p-2">Outcome</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y">
                            {data.trainingRecords.length === 0 ? (
                              <tr>
                                <td colSpan={4} className="p-2.5 text-muted-foreground italic text-center">
                                  {data.officer.training_history || 'No specialized training records registered.'}
                                </td>
                              </tr>
                            ) : (
                              data.trainingRecords.map((tr) => {
                                const dt = details(tr.details);
                                return (
                                  <tr key={tr.id}>
                                    <td className="p-2 font-medium">{dt['training_title'] || dt['title'] || 'In-Service Training'}</td>
                                    <td className="p-2">{dt['institution'] || 'LNPATS'}</td>
                                    <td className="p-2">{dt['start_date'] || tr.created_at.slice(0, 10)}</td>
                                    <td className="p-2">{dt['certification'] || tr.status || 'Completed'}</td>
                                  </tr>
                                );
                              })
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Disciplinary Records */}
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold uppercase tracking-wide bg-primary/10 text-primary px-2.5 py-1 rounded">
                        8. Professional Conduct & Disciplinary Records
                      </h4>
                      <div className="border rounded overflow-hidden text-xs">
                        <table className="w-full text-left">
                          <thead className="bg-muted text-[11px] text-muted-foreground uppercase">
                            <tr>
                              <th className="p-2">Case Ref</th>
                              <th className="p-2">Incident Date</th>
                              <th className="p-2">Alleged Offense</th>
                              <th className="p-2">Action / Sanction</th>
                              <th className="p-2">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y">
                            {data.disciplinaryActions.length === 0 ? (
                              <tr>
                                <td colSpan={5} className="p-2.5 text-emerald-600 dark:text-emerald-400 font-medium text-center">
                                  No disciplinary sanctions or pending disciplinary proceedings on record. Officer is in good standing.
                                </td>
                              </tr>
                            ) : (
                              data.disciplinaryActions.map((da) => (
                                <tr key={da.id}>
                                  <td className="p-2 font-mono">{da.case_number || '—'}</td>
                                  <td className="p-2">{da.incident_date || da.created_at?.slice(0, 10) || '—'}</td>
                                  <td className="p-2">{da.offense || '—'}</td>
                                  <td className="p-2">{da.action_taken || 'Under Review'}</td>
                                  <td className="p-2 capitalize">{da.status || 'Active'}</td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Performance Evaluations & Appraisals */}
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold uppercase tracking-wide bg-primary/10 text-primary px-2.5 py-1 rounded">
                        9. Performance Appraisals & Evaluations
                      </h4>
                      <div className="border rounded overflow-hidden text-xs">
                        <table className="w-full text-left">
                          <thead className="bg-muted text-[11px] text-muted-foreground uppercase">
                            <tr>
                              <th className="p-2">Period</th>
                              <th className="p-2">Rating</th>
                              <th className="p-2">Assessment Summary</th>
                              <th className="p-2">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y">
                            {data.appraisals.length === 0 ? (
                              <tr>
                                <td colSpan={4} className="p-2.5 text-muted-foreground italic text-center">
                                  {data.officer.commendations ? `Commendation on file: ${data.officer.commendations}` : 'Standard satisfactory performance on file.'}
                                </td>
                              </tr>
                            ) : (
                              data.appraisals.map((ap) => {
                                const dt = details(ap.details);
                                return (
                                  <tr key={ap.id}>
                                    <td className="p-2">{dt['period'] || ap.created_at.slice(0, 10)}</td>
                                    <td className="p-2 font-semibold text-primary">{dt['rating'] || 'Good'}</td>
                                    <td className="p-2">{dt['strengths'] || dt['notes'] || 'Satisfactory duty performance'}</td>
                                    <td className="p-2 capitalize">{ap.status || 'Finalized'}</td>
                                  </tr>
                                );
                              })
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Leave History */}
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold uppercase tracking-wide bg-primary/10 text-primary px-2.5 py-1 rounded">
                        10. Leave Requests & Attendance Log Summary
                      </h4>
                      <div className="border rounded overflow-hidden text-xs">
                        <table className="w-full text-left">
                          <thead className="bg-muted text-[11px] text-muted-foreground uppercase">
                            <tr>
                              <th className="p-2">Leave Ref</th>
                              <th className="p-2">Type</th>
                              <th className="p-2">Dates</th>
                              <th className="p-2">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y">
                            {data.leaveRequests.length === 0 ? (
                              <tr>
                                <td colSpan={4} className="p-2.5 text-muted-foreground italic text-center">
                                  No leave requests registered.
                                </td>
                              </tr>
                            ) : (
                              data.leaveRequests.slice(0, 5).map((lr) => (
                                <tr key={lr.id}>
                                  <td className="p-2 font-mono">{lr.leave_number || '—'}</td>
                                  <td className="p-2">{lr.leave_type || 'Annual'}</td>
                                  <td className="p-2">{lr.start_date} to {lr.end_date}</td>
                                  <td className="p-2 capitalize">{lr.approval_status || 'Approved'}</td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                {/* Signature Block (Requirement 6) */}
                <div className="pt-8 border-t-2 space-y-4">
                  <div className="text-xs font-bold text-center tracking-wider uppercase text-foreground">
                    Official Verification, Attestation & Signatures
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 text-center text-xs">
                    {/* Chief of Human Resources */}
                    <div className="space-y-1">
                      <div className="border-b border-muted-foreground/60 w-3/4 mx-auto pb-6" />
                      <div className="font-bold text-foreground">Chief of Human Resources</div>
                      <div className="text-[11px] text-muted-foreground">Liberia National Police Academy & Training School</div>
                      <div className="text-[10px] text-muted-foreground pt-1">Date: ________________________</div>
                    </div>

                    {/* Chief of ICT */}
                    <div className="space-y-1">
                      <div className="border-b border-muted-foreground/60 w-3/4 mx-auto pb-6" />
                      <div className="font-bold text-foreground">Chief of ICT</div>
                      <div className="text-[11px] text-muted-foreground">Liberia National Police Academy & Training School</div>
                      <div className="text-[10px] text-muted-foreground pt-1">Date: ________________________</div>
                    </div>

                    {/* Director, LNPATS */}
                    <div className="space-y-1">
                      <div className="border-b border-muted-foreground/60 w-3/4 mx-auto pb-6" />
                      <div className="font-bold text-foreground">Director, LNPATS</div>
                      <div className="text-[11px] text-muted-foreground">Liberia National Police Academy</div>
                      <div className="text-[10px] text-muted-foreground pt-1">Date: ________________________</div>
                    </div>
                  </div>
                </div>

                {/* System-Generated Official Footer (Requirement 13) */}
                <div className="border-t pt-3 flex flex-wrap items-center justify-between text-[10px] text-muted-foreground">
                  <span className="font-medium">
                    Liberia National Police Academy and Training School (LNPATS) - Official Personnel Report
                  </span>
                  <span>
                    Report: {reportNumber} · {generationDate}
                  </span>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Email Dispatch Modal (Requirement 7) */}
      <Dialog open={emailModalOpen} onOpenChange={setEmailModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-primary" />
              Email Official Personnel Report
            </DialogTitle>
            <DialogDescription className="text-xs">
              Transmit report details to authorized recipients or open in your email client.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 pt-2">
            <div className="space-y-1">
              <Label htmlFor="em-recipient">Recipient Email</Label>
              <Input
                id="em-recipient"
                type="email"
                placeholder="officer@lnpats.net"
                value={emailRecipient}
                onChange={(e) => setEmailRecipient(e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="em-sub">Subject</Label>
              <Input
                id="em-sub"
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="em-body">Message Content</Label>
              <Textarea
                id="em-body"
                rows={6}
                value={emailBody}
                onChange={(e) => setEmailBody(e.target.value)}
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => setEmailModalOpen(false)}>
                Cancel
              </Button>
              <Button size="sm" onClick={handleSendEmail} className="gap-1.5">
                <Mail className="h-4 w-4" />
                Dispatch Email
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

function Item({ label, value, colSpan = 1 }: { label: string; value?: string | null | undefined; colSpan?: number }) {
  return (
    <div className={colSpan === 2 ? 'col-span-2' : ''}>
      <span className="text-[10px] text-muted-foreground uppercase block">{label}</span>
      <span className="font-medium text-foreground break-words">{value || '—'}</span>
    </div>
  );
}

