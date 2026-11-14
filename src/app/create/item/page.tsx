import { CreateForm } from '@/components/marketplace/create-form';
import { demoEnabled } from '@/lib/supabase';
export const metadata = { title: 'List an item' };
export const dynamic = 'force-dynamic';
export default function CreateItemPage() { return <CreateForm demo={demoEnabled()} />; }
