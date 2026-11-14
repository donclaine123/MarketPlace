import { InputError, isUuid } from './validation.ts';
export async function checkPhotoReference(url: string, projectUrl: string, exists: (path: string) => Promise<boolean>) {
  const prefix = `${projectUrl.replace(/\/$/, '')}/storage/v1/object/public/listing-images/`;
  const path = url.startsWith(prefix) ? url.slice(prefix.length) : '';
  const match = /^(.*)\.(jpg|png|webp)$/.exec(path);
  if (!match || !isUuid(match[1])) throw new InputError('Please upload a photo using this form.');
  if (!await exists(path)) throw new InputError('This photo is no longer available. Please upload it again.');
}
