import { getSupabase, demoEnabled } from './supabase';
import { sampleListings } from './sample-listings';
import type { Listing } from './types';
export async function getListing(id: string): Promise<Listing | null> {
  if (demoEnabled()) return sampleListings.find(item => item.id === id) ?? null;
  const { data, error } = await getSupabase().from('listings').select('*').eq('id', id).maybeSingle();
  if (error) { console.error('Listing read failed:', error.code); throw new Error('We couldn’t load this listing. Please try again.'); }
  return data as Listing | null;
}
