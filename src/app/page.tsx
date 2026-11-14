import { Sidebar } from '@/components/layout/sidebar';
import { Catalog } from '@/components/marketplace/catalog';
export default function Home() { return <div className="marketplace-layout"><Sidebar /><main id="main-content"><Catalog /></main></div>; }
