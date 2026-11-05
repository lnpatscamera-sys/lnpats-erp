import { useEffect, useState } from 'react';
import { getBranding, letterheadUrl, DEFAULT_FOOTER } from '@/lib/letterhead';

/** Shown only on printed pages: official letterhead on top, footer at the bottom. */
export function PrintLetterhead() {
  const [b, setB] = useState({ url: letterheadUrl, footer: DEFAULT_FOOTER });
  useEffect(() => { getBranding().then(setB).catch(() => {}); }, []);
  return <>
    <div className="print-only print-letterhead"><img src={b.url} alt="LNPATS official letterhead" /></div>
    <div className="print-only print-footer">{b.footer}</div>
  </>;
}
