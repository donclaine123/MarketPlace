'use client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
export default function ErrorPage({ reset }: { reset: () => void }) { return <main id="main-content" className="center-state"><h1>Something didn’t load</h1><p>We couldn’t reach the marketplace. Please try again in a moment.</p><Button onClick={reset}>Try again</Button><Link href="/" className="text-link">Back to marketplace</Link></main>; }
