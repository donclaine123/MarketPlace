'use client';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2 } from 'lucide-react';
export function CreatedNotice() { const params = useSearchParams(); return params.get('created') === '1' ? <div className="created-notice" role="status"><CheckCircle2 size={18} />Your listing is live. Here’s to its next chapter!</div> : null; }
