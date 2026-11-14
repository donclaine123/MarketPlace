import { Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { ArrowLeft, ArrowRight, CalendarDays, Mail, MapPin, ShieldCheck } from 'lucide-react';
import { getListing } from '@/lib/data';
import { demoEnabled, getSupabase } from '@/lib/supabase';
import { categorySlug, isUuid } from '@/lib/validation';
import { money } from '@/lib/utils';
import { MessageForm } from '@/components/marketplace/message-form';
import { CreatedNotice } from '@/components/marketplace/created-notice';
import { BuyButton } from '@/components/marketplace/buy-button';
import { paymentAmounts, sellerEmail } from '@/lib/payment-rules';
export const dynamic = 'force-dynamic';
export default async function ItemPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!isUuid(id)) notFound();
  const listing = await getListing(id);
  if (!listing) notFound();
  const demo = demoEnabled();
  let purchasable = false;
  if (!demo && !listing.sold_at && process.env.STRIPE_SECRET_KEY) {
    try {
      paymentAmounts(listing.price);
      const { data } = await getSupabase().from('sellers').select('charges_enabled,payouts_enabled,details_submitted').eq('email', sellerEmail(listing.seller_email)).maybeSingle();
      purchasable = Boolean(data?.charges_enabled && data?.payouts_enabled && data?.details_submitted);
    } catch { /* Existing listings stay readable before the payment migration is applied. */ }
  }
  return <main id="main-content" className="detail-page">
    <Link href="/" className="back-link"><ArrowLeft size={17} />Back to marketplace</Link>
    <Suspense><CreatedNotice /></Suspense>
    <div className="detail-layout"><div className="detail-visual">
      <div className="detail-image"><Image src={listing.image_url} alt={listing.title} fill priority sizes="(max-width: 767px) 100vw, 60vw" className="object-contain" /></div>
      <p className="photo-caption">A good find, ready for its next home.</p>
    </div><div className="detail-info">
      <Link href={`/category/${categorySlug(listing.category)}`} className="detail-category">{listing.category}<ArrowRight size={12} /></Link>
      {demo && <span className="sample-badge">Sample listing</span>}
      {listing.sold_at && <span className="sold-badge">Sold</span>}
      <h1>{listing.title}</h1><strong className="detail-price">{money(listing.price)}</strong>
      <div className="detail-meta"><span><MapPin size={15} />{listing.location}</span><span><CalendarDays size={15} />Listed {new Date(listing.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' })}</span></div>
      <div className="detail-divider" /><section className="detail-description"><h2>The details</h2><p>{listing.description}</p></section>
      <div className="seller-card"><span className="seller-avatar">{listing.seller_email[0].toUpperCase()}</span><div><h2>Seller information</h2>{demo ? <span className="seller-email">Sample seller</span> : <a href={`mailto:${listing.seller_email}`}><Mail size={13} />{listing.seller_email}</a>}</div></div>
      {listing.sold_at ? <p className="payment-notice" role="status">This find has a new home. It’s no longer available.</p> : <>
        {purchasable ? <BuyButton listingId={listing.id} /> : !demo && <p className="field-help">Online checkout is not available for this item. <Link className="text-link" href={`/connect?email=${encodeURIComponent(listing.seller_email)}`}>Seller? Connect with Stripe →</Link></p>}
        <MessageForm listingId={listing.id} demo={demo} />
      </>}
      <p className="safety-note"><ShieldCheck size={18} /><span>Meet in a public place and arrange pickup with the seller. Online payments here use Stripe’s sandbox; no real money moves.</span></p>
    </div></div>
    <div className="detail-bottom"><span>There’s more good out there.</span><Link href="/">Keep exploring<ArrowRight size={16} /></Link></div>
  </main>;
}
