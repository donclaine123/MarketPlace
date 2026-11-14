import { OrderConfirmation } from '@/components/marketplace/order-confirmation';
export const metadata = { title: 'Order confirmation', robots: { index: false, follow: false } };
export default async function SuccessPage({ searchParams }: { searchParams: Promise<{ order_id?: string; session_id?: string }> }) {
  const query = await searchParams;
  return <main id="main-content" className="payment-page"><OrderConfirmation orderId={typeof query.order_id === 'string' ? query.order_id : ''} sessionId={typeof query.session_id === 'string' ? query.session_id : ''} /></main>;
}
