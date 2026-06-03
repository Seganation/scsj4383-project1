import { CheckoutClient } from './checkout-client';
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Secure Checkout',
  description: 'Complete your purchase securely with Stripe. Fast and secure checkout for your kitchen appliances and outdoor equipment.',
  keywords: [
    'secure checkout',
    'stripe payment',
    'kitchen appliances checkout',
    'secure payment'
  ],

  robots: {
    index: false,
    follow: false,
  },
  alternates: {
    canonical: 'https://archcoolstore.com/checkout',
  },
};

export default function CheckoutPage() {
  return <CheckoutClient />;
}
