import { type ReactNode } from "react";
import { ClientNavbar } from "@/components/storefront/ClientNavbar";
import { Footer } from "@/components/storefront/Footer";

export default function PublicLayout({ children }: { children: ReactNode }) {
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://archcoolstore.com'
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <ClientNavbar />
      <main className="min-h-screen bg-paper text-ink">{children}</main>
      <Footer />
    </>
  );
}
