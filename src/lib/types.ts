import type { Category } from './validation';
export type Listing = {
  id: string;
  title: string;
  description: string;
  price: number;
  category: Category;
  seller_email: string;
  image_url: string;
  location: string;
  created_at: string;
};
