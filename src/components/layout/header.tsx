import Link from 'next/link';
import { Store, Plus, MapPin, ArrowUpRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
export function Header() {
  return <header className="site-header"><div className="header-inner">
    <Link href="/" className="brand" aria-label="Marketplace home"><span className="brand-icon"><Store size={23} strokeWidth={2.1} /></span><span>marketplace<span className="brand-dot">.</span></span></Link>
    <nav className="header-nav" aria-label="Main navigation"><Link href="/" className="header-active">Discover</Link><Link href="/create">Start selling <ArrowUpRight size={14} /></Link><Link href="/connect">Connect with Stripe</Link></nav>
    <div className="header-actions"><span className="header-location"><MapPin size={15} /> Your local community</span><Button asChild size="sm"><Link href="/create"><Plus size={17} /><span>Sell something</span></Link></Button></div>
  </div></header>;
}
