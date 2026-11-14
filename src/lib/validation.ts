export const categories = ['Furniture', 'Electronics', 'Clothing', 'Vehicles', 'Home & Garden', 'Sports & Outdoors', 'Entertainment', 'Family', 'Other'] as const;
export type Category = typeof categories[number];
export const categorySlug = (category: string) => category.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-');
export const isUuid = (value: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);

export class InputError extends Error {}
function record(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new InputError('Please provide a valid form.');
  return value as Record<string, unknown>;
}
function text(value: unknown, label: string, max: number) {
  if (typeof value !== 'string' || !value.trim() || value.trim().length > max) throw new InputError(`${label} is required and must be ${max} characters or fewer.`);
  return value.trim();
}
function email(value: unknown, label: string) {
  const result = text(value, label, 254);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(result)) throw new InputError(`Enter a valid ${label.toLowerCase()}.`);
  return result;
}
export function validateListing(value: unknown) {
  const input = record(value);
  const rawPrice = typeof input.price === 'number' || typeof input.price === 'string' ? String(input.price) : '';
  if (!/^\d{1,8}(\.\d{1,2})?$/.test(rawPrice) || !Number.isFinite(Number(rawPrice))) throw new InputError('Enter a price between $0 and $99,999,999.99 with up to two decimal places.');
  if (!categories.includes(input.category as Category)) throw new InputError('Choose a valid category.');
  const image = text(input.image_url, 'Photo', 2048);
  try { if (new URL(image).protocol !== 'https:') throw new Error(); } catch { throw new InputError('Upload a valid photo.'); }
  return {
    title: text(input.title, 'Title', 120),
    description: text(input.description, 'Description', 5000),
    price: Number(rawPrice),
    category: input.category as Category,
    location: text(input.location, 'Location', 120),
    seller_email: email(input.seller_email, 'Seller email'),
    image_url: image,
  };
}
export function validateMessage(value: unknown) {
  const input = record(value);
  if (typeof input.listing_id !== 'string' || !isUuid(input.listing_id)) throw new InputError('Choose a valid listing.');
  return { listing_id: input.listing_id, buyer_email: email(input.buyer_email, 'Buyer email'), message: text(input.message, 'Message', 2000) };
}
export function imageExtension(bytes: Uint8Array, mime: string) {
  if (mime === 'image/jpeg' && bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255) return 'jpg';
  if (mime === 'image/png' && [137,80,78,71,13,10,26,10].every((value, index) => bytes[index] === value)) return 'png';
  if (mime === 'image/webp' && new TextDecoder().decode(bytes.slice(0, 4)) === 'RIFF' && new TextDecoder().decode(bytes.slice(8, 12)) === 'WEBP') return 'webp';
  throw new InputError('Choose a JPEG, PNG, or WebP photo.');
}
