import Link from 'next/link';
import { Armchair, Bike, Car, ChevronRight, Clapperboard, Flower2, HeartHandshake, LayoutGrid, Laptop, MapPin, Plus, Shirt, Shapes, ToyBrick, type LucideIcon } from 'lucide-react';
import { categories, categorySlug } from '@/lib/validation';
import { Button } from '@/components/ui/button';
const icons: LucideIcon[] = [Armchair, Laptop, Shirt, Car, Flower2, Bike, Clapperboard, ToyBrick, Shapes];
export function Sidebar({ activeCategory }: { activeCategory?: string }) {
  return <aside className="sidebar"><div className="sidebar-title">Marketplace</div><p className="sidebar-subtitle">A good find is closer than you think.</p>
    <nav aria-label="Marketplace navigation"><Link href="/" className={`sidebar-link ${!activeCategory ? 'selected' : ''}`} aria-current={!activeCategory ? 'page' : undefined}><span className="nav-icon"><LayoutGrid size={19} /></span>Browse all<ChevronRight className="ml-auto" size={16} /></Link></nav>
    <Button asChild variant="outline" className="sidebar-create"><Link href="/create"><Plus size={18} />Create new listing</Link></Button>
    <div className="sidebar-divider" /><h2 className="sidebar-label">Categories</h2>
    <nav className="category-nav" aria-label="Categories">{categories.map((category, index) => { const Icon = icons[index]; return <Link key={category} href={`/category/${categorySlug(category)}`} className={`sidebar-link ${activeCategory === category ? 'selected' : ''}`} aria-current={activeCategory === category ? 'page' : undefined}><span className="nav-icon"><Icon size={19} /></span>{category}</Link>; })}</nav>
    <div className="sidebar-community"><HeartHandshake size={24} /><strong>Good things, second time around.</strong><p>Buy local. Sell a little. Make someone’s day.</p></div>
    <div className="sidebar-footer"><MapPin size={13} /> Made for your neighborhood</div>
  </aside>;
}
