import { notFound } from 'next/navigation';
import { categories, categorySlug } from '@/lib/validation';
import { Sidebar } from '@/components/layout/sidebar';
import { Catalog } from '@/components/marketplace/catalog';
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) { const { slug } = await params; return { title: categories.find(item => categorySlug(item) === slug) || 'Category not found' }; }
export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const category = categories.find(item => categorySlug(item) === slug);
  if (!category) notFound();
  return <div className="marketplace-layout"><Sidebar activeCategory={category} /><main id="main-content"><Catalog category={category} /></main></div>;
}
