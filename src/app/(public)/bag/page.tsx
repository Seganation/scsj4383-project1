import { BagClient } from './bag-client';
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Shopping Bag',
  description: 'Review your selected kitchen appliances and outdoor equipment before checkout. Secure shopping cart at ArchCool Store.',
  keywords: [
    'shopping bag',
    'cart',
    'checkout',
    'kitchen appliances',
    'outdoor equipment'
  ],

  robots: {
    index: false,
    follow: true,
  },
  alternates: {
    canonical: 'https://archcoolstore.com/bag',
  },
};

export default function BagRoute() {
  return <BagClient />;
}
