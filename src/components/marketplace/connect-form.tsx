'use client';
import { useEffect, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { CheckCircle2, CreditCard, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function ConnectForm({ initialEmail, returned, refresh }: { initialEmail: string; returned: boolean; refresh: boolean }) {
  const [email, setEmail] = useState(initialEmail);
  const [busy, setBusy] = useState(false);
  const [connected, setConnected] = useState(false);
  const [message, setMessage] = useState(refresh ? 'Your onboarding link expired. Continue below to get a new one.' : '');
  const [error, setError] = useState('');
  useEffect(() => {
    if (!returned || !initialEmail) return;
    let active = true;
    fetch('/api/stripe/connect/status', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: initialEmail }) }).then(async response => {
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      if (active) { setConnected(data.connected); setMessage(data.connected ? 'Your listings can now accept sandbox payments.' : 'Stripe still needs some information. Continue onboarding below, or return shortly if verification is pending.'); }
    }).catch(error => { if (active) setError(error.message || 'Could not check your onboarding status.'); });
    return () => { active = false; };
  }, [returned, initialEmail]);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError('');
    try {
      const response = await fetch('/api/stripe/connect', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Could not start onboarding.');
      window.location.assign(data.url);
    } catch (error) { setError(error instanceof Error ? error.message : 'Please try again.'); setBusy(false); }
  }
  return <div className="payment-card"><span className="sample-badge">Test payments only</span>{connected ? <CheckCircle2 size={36} className="text-green-700" /> : <CreditCard size={36} className="text-blue-700" />}<h1>{connected ? 'You’re ready to sell.' : 'Get paid for your good finds.'}</h1><p>Connect a Stripe sandbox account using the same email as your listings. A 10% marketplace fee applies; Stripe processing fees also apply.</p>{message && <p role="status" className="payment-notice">{message}</p>}{!connected && <form onSubmit={submit}><label className="form-label" htmlFor="seller-email">Seller email<Input id="seller-email" type="email" value={email} onChange={event => setEmail(event.target.value)} required maxLength={254} autoComplete="email" disabled={busy} /></label><p className="field-help">Choose United States and use Stripe’s test onboarding details. This challenge matches sellers by email without a login.</p><Button className="w-full" type="submit" disabled={busy}>{busy && <Loader2 size={17} className="animate-spin" />}{busy ? 'Connecting…' : 'Connect with Stripe'}</Button></form>}{error && <p className="form-error" role="alert">{error}</p>}<Link href={connected ? '/create/item' : '/'} className="text-link">{connected ? 'Create a listing →' : 'Back to marketplace'}</Link></div>;
}
