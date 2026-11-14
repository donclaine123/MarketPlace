'use client';
import { useState, type FormEvent } from 'react';
import { CheckCircle2, Loader2, MessageCircle, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
export function MessageForm({ listingId, demo }: { listingId: string; demo: boolean }) {
  const [open, setOpen] = useState(false);
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(''); setBusy(true);
    const fields = new FormData(event.currentTarget);
    try {
      const response = await fetch('/api/messages', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ listing_id: listingId, buyer_email: fields.get('buyer_email'), message: fields.get('message') }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Your message couldn’t be saved.');
      setSent(true);
    } catch (err) { setError(err instanceof Error ? err.message : 'Please try again.'); }
    finally { setBusy(false); }
  }
  if (sent) return <div className="message-success" role="status"><CheckCircle2 size={28} /><h3>Your message has been saved.</h3><p>Thanks for giving a good find a second look.</p></div>;
  return <div className="message-section"><Button className="w-full" onClick={() => setOpen(!open)} aria-expanded={open} aria-controls="seller-message"><MessageCircle size={19} />Message seller</Button>{open && <form id="seller-message" onSubmit={submit} className="message-form"><h3>Start a conversation</h3><p>Ask a question or arrange a time to meet.</p>{demo ? <p className="form-demo">This is a sample listing. Messaging is available for real listings once Supabase is connected.</p> : <><label htmlFor="buyer_email" className="form-label">Your email<Input id="buyer_email" type="email" name="buyer_email" placeholder="you@example.com" required maxLength={254} autoComplete="email" disabled={busy} /></label><label htmlFor="message" className="form-label">Message<textarea id="message" className="field" name="message" rows={3} defaultValue="Hi! Is this still available?" required maxLength={2000} disabled={busy} /></label><p className="field-help">Your email is saved with your message so the seller can reply. Email notifications aren’t enabled.</p>{error && <p className="form-error" role="alert">{error}</p>}<Button className="w-full" type="submit" disabled={busy}>{busy ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}{busy ? 'Saving message…' : 'Send message'}</Button></>}</form>}</div>;
}
