import { getSupabase, demoEnabled } from '@/lib/supabase';
import { sampleListings } from '@/lib/sample-listings';
import { categories, InputError, validateListing } from '@/lib/validation';
import { apiError, readJson } from '@/lib/http';
import { checkPhotoReference } from '@/lib/photo-reference';

export async function GET(request: Request) {
  try {
    const params = new URL(request.url).searchParams;
    const search = (params.get('search') || '').trim().slice(0, 100);
    const category = params.get('category') || '';
    if (category && !categories.some(c => c === category)) throw new InputError('Choose a valid category.');
    if (demoEnabled()) return Response.json({ listings: sampleListings.filter(item => (!category || item.category === category) && `${item.title} ${item.description}`.toLowerCase().includes(search.toLowerCase())), demo: true });
    // shortcut: show the newest 100 matches; add pagination when the catalog grows beyond that.
    let query = getSupabase().from('listings').select('*').order('created_at', { ascending: false }).limit(100);
    if (category) query = query.eq('category', category);
    if (search) query = query.ilike('title', `%${search.replace(/[\\%_]/g, '\\$&')}%`);
    const { data, error } = await query;
    if (error) throw error;
    return Response.json({ listings: data, demo: false }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) { return apiError(error); }
}
export async function POST(request: Request) {
  try {
    const listing = validateListing(await readJson(request));
    const supabase = getSupabase();
    await checkPhotoReference(listing.image_url, process.env.SUPABASE_URL!, async path => {
      const { data } = await supabase.storage.from('listing-images').exists(path);
      return Boolean(data);
    });
    const { data, error } = await supabase.from('listings').insert(listing).select().single();
    if (error) throw error;
    return Response.json({ listing: data }, { status: 201 });
  } catch (error) { return apiError(error); }
}
