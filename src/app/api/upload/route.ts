import { getSupabase } from '@/lib/supabase';
import { InputError } from '@/lib/validation';
import { validateImage } from '@/lib/images';
import { apiError } from '@/lib/http';
export const runtime = 'nodejs';
export async function POST(request: Request) {
  try {
    const max = 4 * 1024 * 1024;
    const length = Number(request.headers.get('content-length'));
    if (length > max + 16000) throw new InputError('Photo must be 4 MB or smaller.');
    // Bound the actual body too; Content-Length may be missing or inaccurate.
    const reader = request.body?.getReader();
    if (!reader) throw new InputError('Choose a photo to upload.');
    const chunks: Uint8Array[] = [];
    let size = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.length;
      if (size > max + 16000) { await reader.cancel(); throw new InputError('Photo must be 4 MB or smaller.'); }
      chunks.push(value);
    }
    let form: FormData;
    try { form = await new Response(Buffer.concat(chunks), { headers: { 'Content-Type': request.headers.get('content-type') || '' } }).formData(); }
    catch { throw new InputError('Choose a valid photo.'); }
    const file = form.get('file');
    if (!(file instanceof File) || !file.size || file.size > max) throw new InputError('Choose a photo up to 4 MB.');
    const image = await validateImage(new Uint8Array(await file.arrayBuffer()), file.type);
    const { extension, bytes } = image;
    const path = `${crypto.randomUUID()}.${extension}`;
    const supabase = getSupabase();
    const { error } = await supabase.storage.from('listing-images').upload(path, bytes, { contentType: file.type, upsert: false, cacheControl: '3600' });
    if (error) throw error;
    return Response.json({ url: supabase.storage.from('listing-images').getPublicUrl(path).data.publicUrl }, { status: 201 });
  } catch (error) { return apiError(error); }
}
