'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Check, MapPin, Plus, Search, SearchX, X } from 'lucide-react';
import { categories, categorySlug } from '@/lib/validation';
import type { Listing } from '@/lib/types';
import { ListingCard } from './listing-card';
import { Button } from '@/components/ui/button';

export function Catalog({ category }: { category?: string }) {
  const [search, setSearch] = useState('');
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [demo, setDemo] = useState(false);
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true); setError('');
    const timer = setTimeout(async () => {
      try {
        const params = new URLSearchParams();
        if (search.trim()) params.set('search', search.trim());
        if (category) params.set('category', category);
        const response = await fetch(`/api/listings?${params}`, { signal: controller.signal });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'We couldn’t load the listings.');
        setListings(data.listings); setDemo(data.demo);
      } catch (err) { if (!controller.signal.aborted) setError(err instanceof Error ? err.message : 'We couldn’t load the listings.'); }
      finally { if (!controller.signal.aborted) setLoading(false); }
    }, 250);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [category, search, retry]);
  return <div className="catalog">
    <div className="page-eyebrow"><span className="live-dot" /> THE NEIGHBORHOOD MARKETPLACE</div>
    <div className="catalog-heading"><div><h1>{category || 'Find your next great find.'}</h1><p>Pre-loved things. New possibilities. Right around the corner.</p></div><span className="local-label"><MapPin size={15} /> Shop local, find more</span></div>
    <div className="search-box"><Search size={21} /><input aria-label="Search marketplace" placeholder="Search for a bike, a sofa, or a little inspiration…" value={search} onChange={event => setSearch(event.target.value)} maxLength={100} />{search && <button type="button" aria-label="Clear search" onClick={() => setSearch('')}><X size={18} /></button>}<span className="search-hint">Find something good</span></div>
    <div className="category-tabs" aria-label="Filter listings by category"><Link className={!category ? 'active' : ''} href="/">All finds</Link>{categories.map(item => <Link key={item} href={`/category/${categorySlug(item)}`} className={category === item ? 'active' : ''}>{item}</Link>)}</div>
    {!category && !search && <section className="sell-banner"><div><span className="banner-kicker">LESS CLUTTER. MORE POSSIBILITY.</span><h2>Your next chapter starts with a little space.</h2><p>Give something you loved a new place to call home.</p><Link href="/create">List an item for free <ArrowRight size={16} /></Link></div><div className="banner-art" aria-hidden="true"><div className="art-orbit" /><span className="art-price"><Check size={14} /> A good find</span><div className="art-pot"><div className="art-leaf one" /><div className="art-leaf two" /><div className="art-leaf three" /><div className="art-stem" /><div className="art-vase" /></div><span className="art-spark">✦</span></div></section>}
    <div className="results-heading"><div><h2>{search ? `Results for “${search}”` : category ? `${category} finds` : 'Fresh finds for you'}</h2><p>{loading ? 'Finding good things nearby…' : `${listings.length}${!demo && listings.length === 100 ? '+' : ''} ${listings.length === 1 ? 'find' : 'finds'} worth a second look`}</p></div><span className="sort-label">Newest first</span></div>
    {demo && <div className="demo-note"><span className="live-dot" /> Sample catalog · Publishing and messaging are unavailable in this preview.</div>}
    <div aria-live="polite" aria-busy={loading}>
      {error ? <div className="empty-state" role="alert"><SearchX /><h3>We couldn’t load the marketplace</h3><p>{error}</p><Button onClick={() => setRetry(value => value + 1)}>Try again</Button></div> : loading ? <div className="listing-grid">{Array.from({ length: 8 }, (_, i) => <div className="skeleton-card" key={i}><div /><span /><span /></div>)}</div> : listings.length ? <div className="listing-grid">{listings.map((listing, index) => <ListingCard listing={listing} key={listing.id} priority={index < 4} />)}</div> : <div className="empty-state"><SearchX /><h3>{search ? 'No finds just yet' : 'Be the first to list something'}</h3><p>{search ? 'Try another keyword or explore a different category.' : 'Your next great find could start with something you sell.'}</p>{search ? <Button variant="outline" onClick={() => setSearch('')}>Clear search</Button> : <Button asChild><Link href="/create"><Plus size={17} />Create a listing</Link></Button>}</div>}
    </div><footer className="catalog-footer"><span>A little less new. A little more you.</span><span>Buy · Sell · Belong</span></footer>
  </div>;
}
