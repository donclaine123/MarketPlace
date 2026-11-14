import { getListing } from '@/lib/data';
import { isUuid, InputError } from '@/lib/validation';
import { apiError } from '@/lib/http';
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    if (!isUuid(id)) throw new InputError('Invalid listing ID.');
    const listing = await getListing(id);
    return listing ? Response.json({ listing }) : Response.json({ error: 'Listing not found.' }, { status: 404 });
  } catch (error) { return apiError(error); }
}
