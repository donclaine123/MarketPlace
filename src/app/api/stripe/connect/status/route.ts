import { getSupabase } from '@/lib/supabase';
import { readJson } from '@/lib/http';
import { InputError } from '@/lib/validation';
import { sellerEmail } from '@/lib/payment-rules';
import { getStripe, stripeError } from '@/lib/stripe';

export async function POST(request: Request) {
  try {
    const body = await readJson(request) as { email?: unknown };
    let email: string;
    try { email = sellerEmail(body?.email); } catch { return Response.json({ error: 'Enter a valid seller email.' }, { status: 400 }); }
    const db = getSupabase();
    const { data: seller, error } = await db.from('sellers').select('stripe_account_id').eq('email', email).maybeSingle();
    if (error) throw error;
    if (!seller?.stripe_account_id) return Response.json({ connected: false, started: false });
    const account = await getStripe().accounts.retrieve(seller.stripe_account_id);
    const fields = { charges_enabled: account.charges_enabled, payouts_enabled: account.payouts_enabled, details_submitted: account.details_submitted };
    const { error: updateError } = await db.from('sellers').update(fields).eq('email', email);
    if (updateError) throw updateError;
    return Response.json({ connected: fields.charges_enabled && fields.payouts_enabled && fields.details_submitted, started: true });
  } catch (error) {
    if (error instanceof InputError) return Response.json({ error: error.message }, { status: 400 });
    return stripeError(error);
  }
}
