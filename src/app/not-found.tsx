import Link from 'next/link';
import { SearchX } from 'lucide-react';
import { Button } from '@/components/ui/button';
export default function NotFound() { return <main id="main-content" className="center-state"><SearchX size={40} className="text-primary" /><h1>This find isn’t here</h1><p>The listing or page may have moved. There are more good things to discover.</p><Button asChild><Link href="/">Browse marketplace</Link></Button></main>; }
