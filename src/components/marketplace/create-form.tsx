'use client';
import { useEffect, useRef, useState, type FormEvent, type ChangeEvent, type DragEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, ArrowRight, Camera, CheckCircle2, ImagePlus, Loader2, MapPin, ShieldCheck, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { categories, imageExtension, validateListing } from '@/lib/validation';
import { money } from '@/lib/utils';

export function CreateForm({ demo }: { demo: boolean }) {
  const router = useRouter();
  const [fields, setFields] = useState({ title: '', price: '', description: '', category: '', location: '', seller_email: '' });
  const [photo, setPhoto] = useState<File | null>(null);
  const [preview, setPreview] = useState('');
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const uploaded = useRef<{ file: File; url: string } | null>(null);
  useEffect(() => { if (!photo) { setPreview(''); return; } const url = URL.createObjectURL(photo); setPreview(url); return () => URL.revokeObjectURL(url); }, [photo]);
  function update(event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) { setFields(current => ({ ...current, [event.target.name]: event.target.value })); }
  async function choosePhoto(file?: File) {
    if (!file) return;
    setError('');
    if (file.size > 4 * 1024 * 1024 || !file.size) { setError('Choose a photo up to 4 MB.'); return; }
    try { imageExtension(new Uint8Array(await file.slice(0, 16).arrayBuffer()), file.type); setPhoto(file); uploaded.current = null; }
    catch (err) { setError(err instanceof Error ? err.message : 'Choose a valid photo.'); }
  }
  function drop(event: DragEvent<HTMLDivElement>) { event.preventDefault(); setDragging(false); if (!busy) void choosePhoto(event.dataTransfer.files[0]); }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError('');
    if (!photo) { setError('Add a photo so buyers can see your item.'); fileRef.current?.focus(); return; }
    try { validateListing({ ...fields, image_url: 'https://preview.example/photo.jpg' }); }
    catch (err) { setError(err instanceof Error ? err.message : 'Please check the form.'); return; }
    setBusy(true);
    try {
      let imageUrl = uploaded.current?.file === photo ? uploaded.current.url : '';
      if (!imageUrl) {
        setStatus('Uploading your photo…');
        const body = new FormData(); body.set('file', photo);
        const response = await fetch('/api/upload', { method: 'POST', body });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Your photo couldn’t be uploaded.');
        imageUrl = data.url; uploaded.current = { file: photo, url: imageUrl };
      }
      setStatus('Publishing your listing…');
      const response = await fetch('/api/listings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...fields, image_url: imageUrl }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Your listing couldn’t be published.');
      setStatus('Published! Opening your listing…'); router.push(`/item/${data.listing.id}?created=1`);
    } catch (err) { setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.'); setBusy(false); setStatus(''); }
  }
  return <div className="create-workspace"><main id="main-content" className="create-form-panel"><Link href="/create" className="back-link"><ArrowLeft size={16} />Listing type</Link><div className="page-eyebrow">LET’S FIND IT A NEW HOME</div><h1>Item for sale</h1><p className="form-intro">A few details are all it takes.</p>{demo && <p className="form-demo">You’re in preview mode. Connect Supabase before publishing a listing.</p>}
    <form onSubmit={submit} className="listing-form"><fieldset disabled={busy}>
      <div className={`photo-drop ${dragging ? 'dragging' : ''}`} onDragOver={event => { event.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={drop}>
        {preview ? <><Image src={preview} alt="Your chosen listing photo" fill unoptimized className="object-cover" /><button type="button" className="remove-photo" onClick={() => { setPhoto(null); uploaded.current = null; if (fileRef.current) fileRef.current.value = ''; }} aria-label="Remove photo"><X size={18} /></button></> : <><span className="upload-icon"><ImagePlus size={27} /></span><strong>Add a photo</strong><span>or drag and drop it here</span><small>JPEG, PNG, WebP · Up to 4 MB</small></>}
        <input ref={fileRef} id="photo" aria-label="Listing photo" type="file" accept="image/jpeg,image/png,image/webp" onChange={event => void choosePhoto(event.target.files?.[0])} className={preview ? 'sr-only' : 'upload-input'} />
      </div>
      <div className="form-section-label">THE DETAILS</div>
      <label className="form-label" htmlFor="title">Title<Input id="title" name="title" placeholder="What are you selling?" value={fields.title} onChange={update} required maxLength={120} /></label>
      <div className="form-row"><label className="form-label" htmlFor="price">Price ($)<Input id="price" name="price" type="number" min="0" max="99999999.99" step="0.01" placeholder="0.00" value={fields.price} onChange={update} required /></label><div className="form-label"><label htmlFor="category">Category</label><select className="field" id="category" name="category" value={fields.category} onChange={update} required><option value="" disabled>Select a category</option>{categories.map(item => <option key={item}>{item}</option>)}</select></div></div>
      <label className="form-label" htmlFor="description">Description<textarea className="field" id="description" name="description" placeholder="Tell buyers a little about your item. Condition, size, and the little details help." value={fields.description} onChange={update} required maxLength={5000} rows={4} /></label>
      <label className="form-label" htmlFor="location">Location<Input id="location" name="location" placeholder="City, state" value={fields.location} onChange={update} required maxLength={120} autoComplete="address-level2" /></label>
      <div className="form-label"><label htmlFor="seller_email">Your email</label><Input id="seller_email" name="seller_email" type="email" placeholder="you@example.com" value={fields.seller_email} onChange={update} required maxLength={254} autoComplete="email" aria-describedby="seller-email-help" /><span className="field-help" id="seller-email-help">Shown on your listing so buyers can get in touch.</span></div>
    </fieldset>
    {error && <div className="form-error" role="alert">{error}</div>}<p className="publish-note"><ShieldCheck size={16} />No fees. No account needed. Just a good find.</p><Button className="w-full" type="submit" disabled={busy}>{busy ? <><Loader2 className="animate-spin" size={17} />{status}</> : <>Publish listing<ArrowRight size={17} /></>}</Button><p className="form-bottom-note">Please only list items you own and are allowed to sell.</p></form></main>
    <aside className="preview-panel" aria-label="Live listing preview"><div className="preview-panel-heading"><h2>Listing preview</h2><span><span className="live-dot" /> Updates as you go</span></div><div className="preview-card"><div className="preview-photo">{preview ? <Image src={preview} alt="Listing preview" fill unoptimized className="object-cover" /> : <div><Camera size={50} strokeWidth={1} /><p>Your photo goes here</p></div>}</div><div className="preview-copy"><span className="detail-category">{fields.category || 'Your category'}</span><h2>{fields.title || 'Your next great find'}</h2><strong className="preview-price">{fields.price !== '' && Number.isFinite(Number(fields.price)) ? money(Number(fields.price)) : '$0'}</strong><p className="preview-location"><MapPin size={15} />{fields.location || 'Your neighborhood'}</p><hr /><h3>Description</h3><p className="preview-description">{fields.description || 'A little story about your item. Let buyers know what makes it a good find.'}</p></div></div><div className="preview-tip"><CheckCircle2 size={20} /><p><strong>A little detail goes a long way.</strong> A clear photo and an honest description help your item find the right person.</p></div></aside>
  </div>;
}
