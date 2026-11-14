import { ConnectForm } from '@/components/marketplace/connect-form';
export const metadata = { title: 'Connect with Stripe' };
export default async function ConnectPage({ searchParams }: { searchParams: Promise<{ email?: string; returned?: string; refresh?: string }> }) {
  const query = await searchParams;
  return <main id="main-content" className="payment-page"><ConnectForm initialEmail={typeof query.email === 'string' ? query.email.slice(0, 254) : ''} returned={query.returned === '1'} refresh={query.refresh === '1'} /></main>;
}
