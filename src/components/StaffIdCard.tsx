import { idLabel } from '@/lib/hr-enrollment';
import { QRCodeSVG } from 'qrcode.react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Logo } from '@/components/Logo';
import { useOfficerPhoto } from '@/components/PassportPhoto';
import { details, type Employee } from '@/lib/hr';

type P = { e: Pick<Employee, 'full_name' | 'rank' | 'service_number' | 'form_number' | 'blood_group' | 'photo_url' | 'enrollment_profile'> & { personnel_category?: string | null } & { department?: string | null | undefined } };

/** CR80-sized (85.6 x 54 mm) front and back of the LNPATS staff ID card. */
export function StaffIdCard({ e }: P) {
  const photo = useOfficerPhoto(e.photo_url);
  const p = details(e.enrollment_profile);
  const card = 'w-[85.6mm] h-[54mm] rounded-lg overflow-hidden border bg-card text-card-foreground shadow print:shadow-none flex flex-col';
  return <div className="id-card-print flex flex-wrap gap-4 justify-center">
    <div className={card}>
      <div className="bg-sidebar text-sidebar-foreground px-2 py-1 flex items-center gap-2"><Logo className="h-7 w-7" /><div className="leading-tight"><div className="text-[6px] tracking-widest text-sidebar-primary">REPUBLIC OF LIBERIA · LIBERIA NATIONAL POLICE</div><div className="text-[7.5px] font-bold">LNP ACADEMY & TRAINING SCHOOL</div></div></div>
      <div className="stripe-band" />
      <div className="flex gap-2 p-2 flex-1">
        <div className="w-[21mm] h-[27mm] bg-muted rounded overflow-hidden grid place-items-center text-[7px] text-muted-foreground shrink-0">{photo ? <img src={photo} alt={e.full_name} className="w-full h-full object-cover" /> : 'Photo'}</div>
        <div className="text-[7px] space-y-[1px] min-w-0">
          <div className="font-bold text-[9px] leading-tight">{e.full_name}</div>
          <div><span className="text-muted-foreground">Rank:</span> {e.rank}</div>
          <div><span className="text-muted-foreground">{idLabel(e.personnel_category)}:</span> {e.service_number}</div>
          <div><span className="text-muted-foreground">Staff File Number:</span> {e.form_number ?? '—'}</div>
          <div className="truncate"><span className="text-muted-foreground">Dept:</span> {e.department || '—'}</div>
          <div><span className="text-muted-foreground">Blood group:</span> {e.blood_group || '—'}</div>
        </div>
      </div>
    </div>
    <div className={card}>
      <div className="p-2 text-[6.5px] space-y-1 flex-1">
        <p className="font-semibold text-[7.5px]">OFFICIAL IDENTIFICATION</p>
        <p>The bearer whose photograph appears overleaf is a member of the Liberia National Police serving at the LNP Academy & Training School. This card remains the property of the Liberia National Police and must be surrendered on demand.</p>
        <p><span className="text-muted-foreground">Emergency contact:</span> {p['emergency_name'] || '—'}{p['emergency_relationship'] ? ` (${p['emergency_relationship']})` : ''} {p['emergency_phone'] || ''}</p>
        <p>If found, return to LNPATS, Paynesville, Liberia.</p>
      </div>
      <div className="px-2 pb-2 flex items-end justify-between"><div className="text-[6px] border-t pt-0.5 w-24">Authorized signature</div><QRCodeSVG value={`LNPATS:${e.service_number}:${e.form_number ?? ''}`} size={44} /></div>
    </div>
  </div>;
}

export function StaffIdCardDialog({ e, onClose }: P & { onClose: () => void }) {
  return <Dialog open onOpenChange={o => !o && onClose()}><DialogContent className="max-w-3xl"><DialogHeader><DialogTitle>Staff ID card — {e.full_name}</DialogTitle></DialogHeader>
    <StaffIdCard e={e} />
    <div className="flex justify-end"><Button onClick={() => window.print()}>Print / save as PDF</Button></div>
  </DialogContent></Dialog>;
}
