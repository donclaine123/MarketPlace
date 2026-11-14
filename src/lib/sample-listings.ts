import type { Listing } from './types';
const photo = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=900&q=85`;
export const sampleListings: Listing[] = [
  ['00000000-0000-4000-8000-000000000001', 'Mid-century accent chair', 145, 'Furniture', 'photo-1567538096630-e0c55bd6374c', 'Palo Alto, CA', 'A comfortable statement piece with warm wood legs. Gently used and ready for a new reading corner.'],
  ['00000000-0000-4000-8000-000000000002', 'Fujifilm X-T camera', 480, 'Electronics', 'photo-1516035069371-29a1b244cc32', 'Mountain View, CA', 'Well cared for camera for everyday adventures. Includes the lens, battery, and strap.'],
  ['00000000-0000-4000-8000-000000000003', 'City commuter bicycle', 220, 'Sports & Outdoors', 'photo-1485965120184-e220f721d03e', 'Stanford, CA', 'A reliable bicycle for campus and coffee runs. Recently serviced and rides smoothly.'],
  ['00000000-0000-4000-8000-000000000004', 'Monstera in ceramic pot', 35, 'Home & Garden', 'photo-1501004318641-b39e6451bec6', 'Palo Alto, CA', 'Healthy, happy houseplant with lots of new growth. Ceramic pot included.'],
  ['00000000-0000-4000-8000-000000000005', 'Sony wireless headphones', 95, 'Electronics', 'photo-1546435770-a3e426bf472b', 'Menlo Park, CA', 'Great sound and a comfortable fit. Includes a charging cable and carrying case.'],
  ['00000000-0000-4000-8000-000000000006', 'Everyday white sneakers', 45, 'Clothing', 'photo-1549298916-b41d501d3772', 'Redwood City, CA', 'Classic everyday sneakers, lightly worn. Clean and ready for their next owner.'],
  ['00000000-0000-4000-8000-000000000007', 'Oak side table', 65, 'Furniture', 'photo-1499933374294-4584851497cc', 'Palo Alto, CA', 'A simple oak side table for your favorite books and morning coffee. Local pickup.'],
  ['00000000-0000-4000-8000-000000000008', 'Acoustic guitar', 120, 'Entertainment', 'photo-1510915361894-db8b60106cb1', 'Los Altos, CA', 'Warm sounding acoustic guitar. A lovely first instrument, with a soft case included.'],
  ['00000000-0000-4000-8000-000000000009', 'Weekend travel backpack', 40, 'Sports & Outdoors', 'photo-1553062407-98eeb64c6a62', 'Mountain View, CA', 'Roomy, comfortable backpack with plenty of pockets. Great for a weekend away.'],
  ['00000000-0000-4000-8000-000000000010', 'Coffee table books', 25, 'Entertainment', 'photo-1495446815901-a7297e633e8d', 'Stanford, CA', 'A small collection of beautiful books looking for a new shelf. Sold as a set.'],
].map(([id, title, price, category, image, location, description]) => ({ id, title, price, category, image_url: photo(image as string), location, description, seller_email: 'sample@example.com', created_at: '2026-11-14T08:00:00.000Z' })) as Listing[];
