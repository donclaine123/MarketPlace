import Link from 'next/link';
import Image from 'next/image';
import { ArrowUpRight, MapPin } from 'lucide-react';
import { money } from '@/lib/utils';
import type { Listing } from '@/lib/types';
export function ListingCard({ listing, priority = false }: { listing: Listing; priority?: boolean }) {
  return <Link className="listing-card group" href={`/item/${listing.id}`}><div className="listing-image"><Image src={listing.image_url} alt={listing.title} fill sizes="(max-width: 479px) 100vw, (max-width: 767px) 50vw, (max-width: 1100px) 33vw, (max-width: 1599px) 25vw, 20vw" className="object-cover transition-transform duration-300 group-hover:scale-[1.04]" priority={priority} /><span className="listing-category">{listing.category}</span><span className="card-arrow"><ArrowUpRight size={18} /></span></div><div className="listing-copy"><strong className="listing-price">{money(listing.price)}</strong><h3>{listing.title}</h3><p><MapPin size={12} />{listing.location}</p></div></Link>;
}
