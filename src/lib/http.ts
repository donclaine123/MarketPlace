import { InputError } from './validation';
import { isConfigured } from './supabase';
export async function readJson(request: Request) {
  if (!request.headers.get('content-type')?.includes('application/json')) throw new InputError('Send a JSON request.');
  const reader = request.body?.getReader();
  if (!reader) throw new InputError('Please provide the form data.');
  const chunks: Uint8Array[] = [];
  let length = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    length += value.length;
    if (length > 20000) { await reader.cancel(); throw new InputError('The form is too large.'); }
    chunks.push(value);
  }
  try { return JSON.parse(Buffer.concat(chunks).toString('utf8')) as unknown; }
  catch { throw new InputError('The form data is not valid JSON.'); }
}
export function apiError(error: unknown) {
  if (error instanceof InputError) return Response.json({ error: error.message }, { status: 400 });
  if (!isConfigured()) return Response.json({ error: 'The marketplace is not connected yet. Listings and messages can’t be saved.' }, { status: 503 });
  console.error('Marketplace operation failed:', error instanceof Error ? error.message : 'Unknown error');
  return Response.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
}
