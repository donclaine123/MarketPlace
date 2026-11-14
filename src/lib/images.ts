import sharp from 'sharp';
import { imageExtension, InputError } from './validation.ts';
export async function validateImage(bytes: Uint8Array, mime: string) {
  const extension = imageExtension(bytes, mime);
  try {
    const output = await sharp(bytes, { limitInputPixels: 25000000, failOn: 'warning' }).rotate().toFormat(extension === 'jpg' ? 'jpeg' : extension).toBuffer();
    if (output.length > 4 * 1024 * 1024) throw new Error('Image too large');
    return { bytes: output, extension };
  } catch { throw new InputError('This photo couldn’t be read. Choose a valid JPEG, PNG, or WebP photo up to 4 MB and 25 megapixels.'); }
}
