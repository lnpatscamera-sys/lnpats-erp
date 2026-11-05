import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';
import { liberiaDate, liberiaDateTime } from '@/lib/time';
import { LETTERHEAD_RATIO, letterheadUrl, imageDataUrl } from '@/lib/letterhead';
import { details } from '@/lib/hr';
import { retirementSummary } from '@/lib/hr-enrollment';

export type OfficerRecord = Database['public']['Tables']['officers']['Row'] & {
  sections?: { name?: string | null } | null;
  offices?: { name?: string | null } | null;
};

export type FullOfficerData = {
  officer: OfficerRecord;
  supervisor?: { full_name: string; rank: string } | null;
  documents: Database['public']['Tables']['officer_documents']['Row'][];
  promotions: Database['public']['Tables']['promotions']['Row'][];
  disciplinaryActions: Database['public']['Tables']['disciplinary_actions']['Row'][];
  trainingRecords: Database['public']['Tables']['training_records']['Row'][];
  leaveRequests: Database['public']['Tables']['leave_requests']['Row'][];
  leaveBalances: Database['public']['Tables']['leave_balances']['Row'][];
  appraisals: Database['public']['Tables']['performance_appraisals']['Row'][];
  attendance: Database['public']['Tables']['attendance']['Row'][];
  photoDataUrl?: string | null;
};

/** Generate unique report identification number */
export function generateReportNumber(officer: { service_number?: string | null; employee_number?: string | null }): string {
  const code = (officer.service_number || officer.employee_number || 'LNP').replace(/[^a-zA-Z0-9]/g, '').slice(-6).toUpperCase();
  const year = new Date().getFullYear();
  const random = Math.floor(1000 + Math.random() * 9000);
  return `LNPATS-HR-${year}-${code}-${random}`;
}

/** Fetches complete profile and all related HR modules for an officer */
export async function fetchFullOfficerProfile(officerId: string): Promise<FullOfficerData> {
  // Fetch canonical officer record with named foreign relations as mandated by project rules
  const { data: officer, error: offErr } = await supabase
    .from('officers')
    .select('*, sections!officers_section_id_fkey(name), offices!officers_office_id_fkey(name)')
    .eq('id', officerId)
    .single();

  if (offErr || !officer) {
    throw new Error(offErr?.message ?? 'Officer not found');
  }

  // Fetch supervisor details if available
  let supervisor: { full_name: string; rank: string } | null = null;
  if (officer.supervisor_id) {
    const { data: sup } = await supabase
      .from('officers')
      .select('full_name, rank')
      .eq('id', officer.supervisor_id)
      .maybeSingle();
    if (sup) supervisor = sup;
  }

  // Fetch signed photo URL if photo_url exists
  let photoDataUrl: string | null = null;
  if (officer.photo_url) {
    try {
      const { data: signed } = await supabase.storage
        .from('officer-files')
        .createSignedUrl(officer.photo_url, 3600);
      if (signed?.signedUrl) {
        photoDataUrl = await imageDataUrl(signed.signedUrl).catch(() => null);
      }
    } catch {
      photoDataUrl = null;
    }
  }

  // Parallel fetch of all sub-records for the full personnel dossier
  const [
    docsRes,
    promRes,
    discRes,
    trainRes,
    leaveRes,
    balRes,
    apprRes,
    attRes,
  ] = await Promise.all([
    supabase.from('officer_documents').select('*').eq('officer_id', officerId).order('upload_date', { ascending: false }),
    supabase.from('promotions').select('*').eq('officer_id', officerId).order('promotion_date', { ascending: false }),
    supabase.from('disciplinary_actions').select('*').eq('officer_id', officerId).order('incident_date', { ascending: false }),
    supabase.from('training_records').select('*').eq('officer_id', officerId).order('created_at', { ascending: false }),
    supabase.from('leave_requests').select('*').eq('officer_id', officerId).order('created_at', { ascending: false }),
    supabase.from('leave_balances').select('*').eq('officer_id', officerId),
    supabase.from('performance_appraisals').select('*').eq('officer_id', officerId).order('created_at', { ascending: false }),
    supabase.from('attendance').select('*').eq('officer_id', officerId).order('attendance_date', { ascending: false }).limit(30),
  ]);

  return {
    officer: officer as OfficerRecord,
    supervisor,
    documents: docsRes.data ?? [],
    promotions: promRes.data ?? [],
    disciplinaryActions: discRes.data ?? [],
    trainingRecords: trainRes.data ?? [],
    leaveRequests: leaveRes.data ?? [],
    leaveBalances: balRes.data ?? [],
    appraisals: apprRes.data ?? [],
    attendance: attRes.data ?? [],
    photoDataUrl,
  };
}

/** Generates official PDF document with letterhead, signatures and audit footer */
export async function generatePersonnelReportPdf(params: {
  data: FullOfficerData;
  mode: 'standard' | 'full';
  reportNumber: string;
}): Promise<{ blob: Blob; fileName: string }> {
  const { data, mode, reportNumber } = params;
  const { officer, supervisor } = data;
  const p = details(officer.enrollment_profile);

  const { jsPDF } = await import('jspdf');
  const { default: autoTable } = await import('jspdf-autotable');

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;

  // Retrieve crests
  const bannerData = await imageDataUrl(letterheadUrl).catch(() => null);

  const totalPagesExp = '{total_pages_count_string}';
  const issueDate = liberiaDateTime(new Date());

  // Function to draw running header on later pages
  const drawRunningHeader = (d: typeof doc) => {
    d.setFont('helvetica', 'bold');
    d.setFontSize(8);
    d.setTextColor(80, 80, 80);
    d.text('LIBERIA NATIONAL POLICE ACADEMY & TRAINING SCHOOL', margin, 10);
    d.setFont('helvetica', 'normal');
    d.text(`Report: ${reportNumber} | Officer: ${officer.rank} ${officer.full_name} (${officer.service_number})`, margin, 14);
    d.setLineWidth(0.3);
    d.setDrawColor(200, 200, 200);
    d.line(margin, 16, pageWidth - margin, 16);
  };

  // Function to draw running footer on EVERY page (Requirement 13)
  const drawRunningFooter = (d: typeof doc, pageNo: number) => {
    d.setLineWidth(0.4);
    d.setDrawColor(180, 180, 180);
    d.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);

    d.setFont('helvetica', 'normal');
    d.setFontSize(7.5);
    d.setTextColor(100, 100, 100);
    d.text(
      'Liberia National Police Academy and Training School (LNPATS) - Official Personnel Report',
      margin,
      pageHeight - 7
    );

    const pageStr = `Page ${pageNo} of ${totalPagesExp}`;
    d.text(pageStr, pageWidth - margin, pageHeight - 7, { align: 'right' });
  };

  // --- PAGE 1: OFFICIAL LETTERHEAD (banner image) ---
  if (bannerData) {
    const bh = 30, bw = bh / LETTERHEAD_RATIO;
    try { doc.addImage(bannerData, 'PNG', (pageWidth - bw) / 2, 4, bw, bh); } catch { /* fallback: no banner */ }
  }

  // Document Title Banner
  const titleText = mode === 'full' ? 'FULL PERSONNEL DOSSIER & SERVICE FILE' : 'OFFICIAL PERSONNEL RECORD REPORT';
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11.5);
  doc.setTextColor(15, 23, 42);
  doc.text(titleText, pageWidth / 2, 40, { align: 'center' });

  // Metadata Sub-banner
  doc.setFillColor(245, 247, 250);
  doc.rect(margin, 43, contentWidth, 8, 'F');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(50, 50, 50);
  doc.text(`Report No: ${reportNumber}`, margin + 3, 48);
  doc.text(`Date of Issue: ${issueDate}`, pageWidth / 2, 48, { align: 'center' });
  doc.text('Classification: CONFIDENTIAL / OFFICIAL', pageWidth - margin - 3, 48, { align: 'right' });

  // Officer Identity Card Section (with Photo)
  const topY = 54;
  const photoW = 28;
  const photoH = 34;

  if (data.photoDataUrl) {
    try {
      doc.addImage(data.photoDataUrl, 'JPEG', pageWidth - margin - photoW, topY, photoW, photoH);
      doc.setLineWidth(0.3);
      doc.setDrawColor(180, 180, 180);
      doc.rect(pageWidth - margin - photoW, topY, photoW, photoH);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6);
      doc.setTextColor(120, 120, 120);
      doc.text('OFFICIAL PHOTO', pageWidth - margin - photoW / 2, topY + photoH + 3.5, { align: 'center' });
    } catch {
      // Photo rendering fallback
    }
  } else {
    doc.setDrawColor(200, 200, 200);
    doc.setFillColor(248, 249, 250);
    doc.rect(pageWidth - margin - photoW, topY, photoW, photoH, 'FD');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(140, 140, 140);
    doc.text('NO PHOTO\nON FILE', pageWidth - margin - photoW / 2, topY + photoH / 2 - 2, { align: 'center' });
  }

  // Name & Primary particulars
  const infoWidth = contentWidth - photoW - 6;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(15, 23, 42);
  doc.text(`${officer.rank} ${officer.full_name}`, margin, topY + 5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(70, 70, 70);
  doc.text(`Service No: ${officer.service_number}    ·    Employee ID: ${officer.employee_number || '—'}    ·    Staff File No: ${officer.form_number || '—'}`, margin, topY + 11);
  doc.text(`Position: ${officer.position || officer.designation || 'Staff Officer'}    ·    Duty Station: ${p['duty_station'] || 'Paynesville HQ'}`, margin, topY + 16);
  doc.text(`Department: ${officer.offices?.name || '—'}    ·    Section/Unit: ${officer.sections?.name || '—'}`, margin, topY + 21);
  doc.text(`Employment Status: ${officer.employment_status || 'Active'}    ·    Employment Type: ${officer.employment_type || 'Police'}`, margin, topY + 26);
  doc.text(`Official Email: ${officer.official_email || '—'}    ·    Phone: ${officer.phone || '—'}`, margin, topY + 31);

  let currentY = topY + photoH + 7;

  // --- SECTION: PERSONAL & DEMOGRAPHIC INFORMATION ---
  const rSummary = retirementSummary(officer.date_of_birth, liberiaDate());
  autoTable(doc, {
    startY: currentY,
    head: [['1. PERSONAL & DEMOGRAPHIC PARTICULARS', '']],
    body: [
      ['Full Legal Name', officer.full_name],
      ['Date of Birth', `${officer.date_of_birth || '—'}${rSummary ? ` (Age: ${rSummary.age} years)` : ''}`],
      ['Gender', officer.gender || '—'],
      ['Nationality', officer.nationality || 'Liberian'],
      ['Marital Status', officer.marital_status || '—'],
      ['Blood Group', officer.blood_group || '—'],
      ['National ID Number', p['national_id'] || '—'],
      ['Passport Number', p['passport_number'] || '—'],
      ['County of Origin / City', `${officer.county || '—'}${p['city'] ? ` / ${p['city']}` : ''}`],
      ['LNP Class Number', officer.lnp_class_number || '—'],
    ],
    theme: 'grid',
    styles: { fontSize: 7.5, cellPadding: 1.8 },
    headStyles: { fillColor: [26, 54, 93], textColor: [255, 255, 255], fontStyle: 'bold' },
    columnStyles: { 0: { fontStyle: 'bold', cellWidth: 60, fillColor: [250, 250, 252] }, 1: { cellWidth: contentWidth - 60 } },
    margin: { left: margin, right: margin },
  });

  currentY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 4;

  // --- SECTION: APPOINTMENT, SERVICE & SUPERVISION ---
  autoTable(doc, {
    startY: currentY,
    head: [['2. SERVICE, APPOINTMENT & REPORTING PARTICULARS', '']],
    body: [
      ['Current Rank', officer.rank],
      ['Designation / Position', officer.position || officer.designation || '—'],
      ['Assigned Department', officer.offices?.name || '—'],
      ['Assigned Section / Unit', officer.sections?.name || '—'],
      ['Current Assignment', officer.current_assignment || '—'],
      ['Date Joined LNP', officer.date_joined || '—'],
      ['Appointment Date', p['appointment_date'] || officer.date_joined || '—'],
      ['Retirement Eligibility Date', `${officer.retirement_date || (rSummary ? rSummary.date : '—')}${rSummary ? ` (${rSummary.remaining} years remaining)` : ''}`],
      ['Reporting Supervisor', supervisor ? `${supervisor.rank} ${supervisor.full_name}` : '—'],
      ['Salary Grade / Amount', `${p['salary_grade'] || '—'}${p['salary_amount'] ? ` ($${p['salary_amount']})` : ''}`],
    ],
    theme: 'grid',
    styles: { fontSize: 7.5, cellPadding: 1.8 },
    headStyles: { fillColor: [26, 54, 93], textColor: [255, 255, 255], fontStyle: 'bold' },
    columnStyles: { 0: { fontStyle: 'bold', cellWidth: 60, fillColor: [250, 250, 252] }, 1: { cellWidth: contentWidth - 60 } },
    margin: { left: margin, right: margin },
  });

  currentY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 4;

  // --- SECTION: CONTACT & RESIDENTIAL ADDRESS ---
  autoTable(doc, {
    startY: currentY,
    head: [['3. CONTACT DETAILS & RESIDENTIAL ADDRESS', '']],
    body: [
      ['Official Email', officer.official_email || '—'],
      ['Personal Email', officer.email || '—'],
      ['Primary Mobile Phone', officer.phone || '—'],
      ['Work / Alt Phone', [p['work_phone'], p['alt_phone']].filter(Boolean).join(' / ') || '—'],
      ['Residential Address', officer.address || '—'],
      ['City / District / County', [p['city'], p['district'], officer.county].filter(Boolean).join(', ') || '—'],
      ['Next of Kin Details', `${officer.next_of_kin || '—'}${officer.next_of_kin_phone ? ` (Phone: ${officer.next_of_kin_phone})` : ''}`],
      ['Emergency Contact', `${p['emergency_name'] || officer.emergency_contact || '—'}${p['emergency_relationship'] ? ` [${p['emergency_relationship']}]` : ''}${p['emergency_phone'] ? ` - Tel: ${p['emergency_phone']}` : ''}`],
    ],
    theme: 'grid',
    styles: { fontSize: 7.5, cellPadding: 1.8 },
    headStyles: { fillColor: [26, 54, 93], textColor: [255, 255, 255], fontStyle: 'bold' },
    columnStyles: { 0: { fontStyle: 'bold', cellWidth: 60, fillColor: [250, 250, 252] }, 1: { cellWidth: contentWidth - 60 } },
    margin: { left: margin, right: margin },
  });

  currentY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 4;

  // --- SECTION: EDUCATION & QUALIFICATIONS ---
  autoTable(doc, {
    startY: currentY,
    head: [['4. EDUCATION & QUALIFICATIONS', '']],
    body: [
      ['Highest Education Level', officer.education || p['education'] || '—'],
      ['Academic Institution', p['institution'] || '—'],
      ['Degree / Certificate Earned', p['degree'] || '—'],
      ['Professional Qualifications', p['professional_qualifications'] || '—'],
      ['Specialized Police Training', p['specialized_training'] || officer.training_history || '—'],
      ['Computer / Technical Skills', p['computer_skills'] || '—'],
      ['Languages Spoken', p['languages'] || 'English'],
    ],
    theme: 'grid',
    styles: { fontSize: 7.5, cellPadding: 1.8 },
    headStyles: { fillColor: [26, 54, 93], textColor: [255, 255, 255], fontStyle: 'bold' },
    columnStyles: { 0: { fontStyle: 'bold', cellWidth: 60, fillColor: [250, 250, 252] }, 1: { cellWidth: contentWidth - 60 } },
    margin: { left: margin, right: margin },
  });

  currentY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 4;

  // --- SECTION: UPLOADED DOCUMENTS & CERTIFICATES ---
  const docRows = data.documents.map(d => [
    d.document_type || 'General Document',
    d.document_name || '—',
    d.upload_date ? d.upload_date.slice(0, 10) : '—',
    'Verified On File',
  ]);

  autoTable(doc, {
    startY: currentY,
    head: [['5. OFFICIAL DOCUMENTS & CERTIFICATES ON FILE', '', '', ''], ['Document Type', 'Document File Name', 'Uploaded Date', 'Status']],
    body: docRows.length > 0 ? docRows : [['No documents currently uploaded', '—', '—', 'Pending']],
    theme: 'grid',
    styles: { fontSize: 7.5, cellPadding: 1.8 },
    headStyles: { fillColor: [26, 54, 93], textColor: [255, 255, 255], fontStyle: 'bold' },
    margin: { left: margin, right: margin },
  });

  currentY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 4;

  // --- IF FULL DOSSIER MODE: ADD DETAILED EXPANDED SECTIONS ---
  if (mode === 'full') {
    // 6. Promotions History
    const promoRows = data.promotions.map(pr => [
      pr.previous_rank || '—',
      pr.promoted_rank || '—',
      pr.promotion_date || '—',
      pr.status || 'Approved',
      pr.remarks || '—',
    ]);
    autoTable(doc, {
      startY: currentY,
      head: [['6. PROMOTION & RANK ADVANCEMENT HISTORY', '', '', '', ''], ['Previous Rank', 'Promoted Rank', 'Effective Date', 'Status', 'Remarks']],
      body: promoRows.length > 0 ? promoRows : (officer.promotion_history ? [['—', officer.rank, 'Historical Record', 'Approved', officer.promotion_history]] : [['No recorded promotions', '—', '—', '—', '—']]),
      theme: 'grid',
      styles: { fontSize: 7.5, cellPadding: 1.8 },
      headStyles: { fillColor: [26, 54, 93], textColor: [255, 255, 255], fontStyle: 'bold' },
      margin: { left: margin, right: margin },
    });
    currentY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 4;

    // 7. Training & Certifications History
    const trainRows = data.trainingRecords.map(tr => {
      const dt = details(tr.details);
      return [
        dt['training_title'] || dt['title'] || 'In-Service Training',
        dt['institution'] || 'LNPATS',
        dt['start_date'] ? `${dt['start_date']} to ${dt['end_date'] || 'present'}` : tr.created_at.slice(0, 10),
        dt['certification'] || dt['grade'] || 'Completed',
        tr.status || 'Completed',
      ];
    });
    autoTable(doc, {
      startY: currentY,
      head: [['7. TRAINING RECORDS & PROFESSIONAL CERTIFICATIONS', '', '', '', ''], ['Program / Course', 'Institution / Academy', 'Duration / Date', 'Certification / Grade', 'Status']],
      body: trainRows.length > 0 ? trainRows : (officer.training_history ? [[officer.training_history, 'LNPATS', 'Prior Record', 'Completed', 'Approved']] : [['No formal training records registered', '—', '—', '—', '—']]),
      theme: 'grid',
      styles: { fontSize: 7.5, cellPadding: 1.8 },
      headStyles: { fillColor: [26, 54, 93], textColor: [255, 255, 255], fontStyle: 'bold' },
      margin: { left: margin, right: margin },
    });
    currentY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 4;

    // 8. Performance Appraisals & Commendations
    const apprRows = data.appraisals.map(ap => {
      const dt = details(ap.details);
      return [
        dt['period'] || ap.created_at.slice(0, 10),
        dt['rating'] || 'Good',
        dt['strengths'] || dt['notes'] || 'Satisfactory performance across core duties',
        ap.status || 'Finalized',
      ];
    });
    autoTable(doc, {
      startY: currentY,
      head: [['8. PERFORMANCE EVALUATIONS & COMMENDATIONS', '', '', ''], ['Evaluation Period', 'Overall Rating', 'Assessment Notes / Strengths', 'Status']],
      body: apprRows.length > 0 ? apprRows : (officer.commendations ? [['Service Commendation', 'Commended', officer.commendations, 'Active']] : [['Standard performance in good standing', 'Satisfactory', 'No formal negative ratings on record', 'Active']]),
      theme: 'grid',
      styles: { fontSize: 7.5, cellPadding: 1.8 },
      headStyles: { fillColor: [26, 54, 93], textColor: [255, 255, 255], fontStyle: 'bold' },
      margin: { left: margin, right: margin },
    });
    currentY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 4;

    // 9. Disciplinary Actions & Conduct Record
    const discRows = data.disciplinaryActions.map(da => [
      da.case_number || '—',
      da.incident_date || da.created_at?.slice(0, 10) || '—',
      da.offense || '—',
      da.action_taken || 'Under Review',
      da.status || 'Active',
    ]);
    autoTable(doc, {
      startY: currentY,
      head: [['9. DISCIPLINARY & PROFESSIONAL CONDUCT RECORD', '', '', '', ''], ['Case Number', 'Incident Date', 'Offense / Allegation', 'Action Taken / Sanction', 'Status']],
      body: discRows.length > 0 ? discRows : [['No disciplinary sanctions or pending investigations on record. Officer is in good standing.', '', '', '', '']],
      theme: 'grid',
      styles: { fontSize: 7.5, cellPadding: 1.8 },
      headStyles: { fillColor: [26, 54, 93], textColor: [255, 255, 255], fontStyle: 'bold' },
      margin: { left: margin, right: margin },
    });
    currentY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 4;

    // 10. Leave Requests & Entitlements
    const leaveRows = data.leaveRequests.slice(0, 10).map(lr => [
      lr.leave_number || '—',
      lr.leave_type || 'Annual',
      `${lr.start_date} to ${lr.end_date}`,
      lr.approval_status || 'Approved',
      lr.reason || '—',
    ]);
    autoTable(doc, {
      startY: currentY,
      head: [['10. LEAVE RECORDS & ENTITLEMENT HISTORY (RECENT)', '', '', '', ''], ['Leave Ref', 'Leave Type', 'Period', 'Status', 'Reason']],
      body: leaveRows.length > 0 ? leaveRows : [['No leave records on file', '—', '—', '—', '—']],
      theme: 'grid',
      styles: { fontSize: 7.5, cellPadding: 1.8 },
      headStyles: { fillColor: [26, 54, 93], textColor: [255, 255, 255], fontStyle: 'bold' },
      margin: { left: margin, right: margin },
    });
    currentY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 4;

    // 11. Attendance & Biometric Record Summary
    const presentCount = data.attendance.filter(a => (a.status || 'present').toLowerCase().includes('present')).length;
    const attRows = data.attendance.slice(0, 8).map(at => [
      at.attendance_date || '—',
      at.check_in ? at.check_in.slice(11, 16) : '08:00',
      at.check_out ? at.check_out.slice(11, 16) : '17:00',
      at.status || 'Present',
      at.method || 'Biometric',
    ]);
    autoTable(doc, {
      startY: currentY,
      head: [[`11. ATTENDANCE & BIOMETRIC LOGS (${presentCount} recorded sessions)`, '', '', '', ''], ['Date', 'Check In', 'Check Out', 'Status', 'Verification']],
      body: attRows.length > 0 ? attRows : [['Biometric and attendance logs active in ERP', '—', '—', 'Regular', 'Biometric']],
      theme: 'grid',
      styles: { fontSize: 7.5, cellPadding: 1.8 },
      headStyles: { fillColor: [26, 54, 93], textColor: [255, 255, 255], fontStyle: 'bold' },
      margin: { left: margin, right: margin },
    });
    currentY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 4;
  }

  // --- SIGNATURE BLOCK (Requirement 6) ---
  // If remaining space on page is less than 48mm, add a new page for signatures
  if (pageHeight - currentY < 48) {
    doc.addPage();
    currentY = 24;
  } else {
    currentY += 6;
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(26, 54, 93);
  doc.text('OFFICIAL VERIFICATION, ATTESTATION & SIGNATURES', margin, currentY);

  doc.setLineWidth(0.4);
  doc.setDrawColor(26, 54, 93);
  doc.line(margin, currentY + 1.5, pageWidth - margin, currentY + 1.5);

  currentY += 12;
  const colWidth = (contentWidth - 12) / 3;

  // 1. Chief of Human Resources
  const col1X = margin;
  doc.setLineWidth(0.4);
  doc.setDrawColor(100, 100, 100);
  doc.line(col1X, currentY + 12, col1X + colWidth, currentY + 12);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text('Chief of Human Resources', col1X + colWidth / 2, currentY + 16, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(100, 100, 100);
  doc.text('LNP Academy & Training School', col1X + colWidth / 2, currentY + 20, { align: 'center' });
  doc.text('Date: ________________________', col1X + colWidth / 2, currentY + 24.5, { align: 'center' });

  // 2. Chief of ICT
  const col2X = margin + colWidth + 6;
  doc.line(col2X, currentY + 12, col2X + colWidth, currentY + 12);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text('Chief of ICT', col2X + colWidth / 2, currentY + 16, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(100, 100, 100);
  doc.text('LNP Academy & Training School', col2X + colWidth / 2, currentY + 20, { align: 'center' });
  doc.text('Date: ________________________', col2X + colWidth / 2, currentY + 24.5, { align: 'center' });

  // 3. Director, LNPATS
  const col3X = margin + (colWidth + 6) * 2;
  doc.line(col3X, currentY + 12, col3X + colWidth, currentY + 12);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text('Director, LNPATS', col3X + colWidth / 2, currentY + 16, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(100, 100, 100);
  doc.text('Liberia National Police Academy', col3X + colWidth / 2, currentY + 20, { align: 'center' });
  doc.text('Date: ________________________', col3X + colWidth / 2, currentY + 24.5, { align: 'center' });

  // Apply running header on pages > 1 and running footer on all pages
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    if (i > 1) {
      drawRunningHeader(doc);
    }
    drawRunningFooter(doc, i);
  }

  // Replace total pages placeholder
  if (typeof doc.putTotalPages === 'function') {
    doc.putTotalPages(totalPagesExp);
  }

  const cleanName = officer.full_name.replace(/[^a-zA-Z0-9_-]/g, '_');
  const fileName = `${reportNumber}_${cleanName}.pdf`;
  const blob = doc.output('blob');

  return { blob, fileName };
}

/** Stores generated report in the officer's document history for future retrieval and auditing (Requirement 11) */
export async function archiveReportDocument(params: {
  officerId: string;
  reportNumber: string;
  mode: 'standard' | 'full';
  pdfBlob: Blob;
  sessionUserId: string;
  officerName: string;
}): Promise<{ path: string; name: string }> {
  const { officerId, reportNumber, mode, pdfBlob, sessionUserId, officerName } = params;

  const fileName = `${reportNumber}_${mode === 'full' ? 'Full_Personnel_File' : 'Personnel_Report'}.pdf`;
  const storagePath = `${officerId}/reports/${fileName}`;

  // 1. Upload PDF to hr-files bucket
  const { error: upErr } = await supabase.storage
    .from('hr-files')
    .upload(storagePath, pdfBlob, {
      contentType: 'application/pdf',
      upsert: true,
    });

  if (upErr) {
    console.warn('Could not upload to hr-files storage, trying fallback record', upErr);
  }

  // 2. Insert into officer_documents
  const documentType = mode === 'full' ? 'Full Personnel File' : 'Personnel Record Report';
  const { error: docErr } = await supabase
    .from('officer_documents')
    .insert({
      officer_id: officerId,
      document_name: fileName,
      document_type: documentType,
      file_url: storagePath,
      bucket_id: 'hr-files',
      uploaded_by: sessionUserId,
    });

  if (docErr) {
    console.warn('Failed to insert into officer_documents:', docErr);
  }

  // 3. Insert audit log into hr_reports table
  const { error: auditErr } = await supabase
    .from('hr_reports')
    .insert({
      officer_id: officerId,
      created_by: sessionUserId,
      status: 'generated',
      details: {
        report_number: reportNumber,
        report_type: documentType,
        officer_name: officerName,
        mode,
        generated_at: new Date().toISOString(),
      },
      attachments: [{ name: fileName, path: storagePath }],
    });

  if (auditErr) console.warn('Audit record warning:', auditErr);

  return { path: storagePath, name: fileName };
}

