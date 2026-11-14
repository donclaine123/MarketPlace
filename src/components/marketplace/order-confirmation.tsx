'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { money } from '@/lib/utils';
type Order = { id: string; listing_id: string; listing_title: string; amount_total: number; status: 'paid' | 'pending' | 'expired' };

export function OrderConfirmation({ orderId, sessionId }: { orderId: string; sessionId: string }) {
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState('');
  const [waiting, setWaiting] = useState(true);
  useEffect(() => {
    let active = true;
    let timer: ReturnType<typeof setTimeout>;
    let attempts = 0;
    async function check() {
      try {
        const response = await fetch(`/api/stripe/orders/${encodeURIComponent(orderId)}?session_id=${encodeURIComponent(sessionId)}`, { cache: 'no-store' });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Could not find your order.');
        if (!active) return;
        setOrder(data.order); setError('');
        if (data.order.status === 'pending' && ++attempts < 20) timer = setTimeout(check, 2000);
        else setWaiting(false);
      } catch (error) { if (active) { setError(error instanceof Error ? error.message : 'Please try again.'); setWaiting(false); } }
    }
    check();
    return () => { active = false; clearTimeout(timer); };
  }, [orderId, sessionId]);
  const paid = order?.status === 'paid';
  return <div className="payment-card">{paid ? <CheckCircle2 size={44} className="text-green-700" /> : waiting ? <Loader2 size={36} className="animate-spin text-blue-700" /> : null}<span className="sample-badge">Stripe sandbox</span><h1>{paid ? 'It’s yours. A great find!' : order?.status === 'expired' ? 'Checkout has expired.' : 'Confirming your payment…'}</h1>{paid ? <><p>Your test payment for <strong>{order.listing_title}</strong> is confirmed. This item is now sold.</p><strong className="detail-price">{money(order.amount_total / 100)}</strong><p className="field-help">Order {order.id}</p></> : <p>{error || (waiting ? 'We’re waiting for Stripe’s secure confirmation. Please keep this page open.' : 'Payment confirmation is still pending. Refresh shortly; don’t pay again.')}</p>}{order && <Link className="text-link" href={`/item/${order.listing_id}`}>View listing →</Link>}<Link className="text-link" href="/">Back to marketplace</Link></div>;
}
