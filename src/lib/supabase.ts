import { createClient } from '@supabase/supabase-js';

export function isConfigured() { return Boolean(process.env.SUPABASE_URL && (process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY)); }
export const demoEnabled = () => !isConfigured() && (process.env.MARKETPLACE_DEMO === 'true' || process.env.NODE_ENV === 'development');
export function getSupabase() {
  if (!isConfigured()) throw new Error('Supabase is not configured. Add SUPABASE_URL and SUPABASE_SECRET_KEY to your environment.');
  return createClient(process.env.SUPABASE_URL!, (process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY)!, { auth: { persistSession: false, autoRefreshToken: false } });
}
