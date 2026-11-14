'use client';
import { useState } from 'react';
import { CreditCard, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function BuyButton({ listingId }: { listingId: string }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  async function buy() {
    setBusy(true); setError('');
    try {
      const response = await fetch('/api/stripe/checkout', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ listing_id: listingId }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Checkout is unavailable.');
      window.location.assign(data.url);
    } catch (error) { setError(error instanceof Error ? error.message : 'Please try again.'); setBusy(false); }
  }
  return <div className="purchase-panel"><span className="sample-badge">Stripe sandbox · No real money</span><Button className="w-full" disabled={busy} onClick={buy}>{busy ? <Loader2 size={18} className="animate-spin" /> : <CreditCard size={18} />}{busy ? 'Opening Checkout…' : 'Buy Now'}</Button><p className="field-help">Secure test checkout. Use card 4242 4242 4242 4242.</p>{error && <p role="alert" className="form-error">{error}</p>}</div>;
}
