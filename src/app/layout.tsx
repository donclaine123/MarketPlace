import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import { Header } from '@/components/layout/header';
import './globals.css';
export const metadata: Metadata = { title: { default: 'Marketplace — Good finds. Great neighbors.', template: '%s | Marketplace' }, description: 'Discover pre-loved finds in your neighborhood. Buy local, create a listing, and give good things a second home.' };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en"><body className={GeistSans.variable}><a className="skip-link" href="#main-content">Skip to content</a><Header />{children}</body></html>; }
