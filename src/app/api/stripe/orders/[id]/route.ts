import { getSupabase } from '@/lib/supabase';
import { isUuid } from '@/lib/validation';
import { stripeError } from '@/lib/stripe';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sessionId = new URL(request.url).searchParams.get('session_id') || '';
  if (!isUuid(id) || !/^cs_test_[A-Za-z0-9]+$/.test(sessionId)) return Response.json({ error: 'Order not found.' }, { status: 404 });
  try {
    const { data, error } = await getSupabase().from('orders').select('id,listing_id,listing_title,amount_total,status').eq('id', id).eq('stripe_session_id', sessionId).maybeSingle();
    if (error) throw error;
    if (!data) return Response.json({ error: 'Order not found.' }, { status: 404 });
    return Response.json({ order: data }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) { return stripeError(error); }
}
