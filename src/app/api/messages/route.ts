import { getSupabase } from '@/lib/supabase';
import { validateMessage } from '@/lib/validation';
import { apiError, readJson } from '@/lib/http';
export async function POST(request: Request) {
  try {
    const message = validateMessage(await readJson(request));
    const supabase = getSupabase();
    const { data: listing, error: listingError } = await supabase.from('listings').select('seller_email').eq('id', message.listing_id).maybeSingle();
    if (listingError) throw listingError;
    if (!listing) return Response.json({ error: 'This listing is no longer available.' }, { status: 404 });
    const { error } = await supabase.from('messages').insert({ ...message, seller_email: listing.seller_email });
    if (error) throw error;
    return Response.json({ success: true }, { status: 201 });
  } catch (error) { return apiError(error); }
}
export function GET() { return Response.json({ error: 'Buyer messages are private.' }, { status: 405, headers: { Allow: 'POST' } }); }
