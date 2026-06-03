import { ContactForm } from "./contact-form";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Support",
  description:
    "Need help with your ArchCool Store purchase? Contact our customer support team for assistance with orders, products, and technical support.",
  keywords: [
    "contact support",
    "customer service",
    "archcool store help",
    "technical support",
    "order assistance",
  ],

  alternates: {
    canonical: "https://archcoolstore.com/contact",
  },
};

export default function ContactPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: "Contact ArchCool Store",
    description: "Get in touch with ArchCool Store customer support",
    url: "https://archcoolstore.com/contact",
    mainEntity: {
      "@type": "Organization",
      name: "ArchCool Store",
      contactPoint: {
        "@type": "ContactPoint",
        telephone: "+1-555-ARCHCOOL",
        contactType: "customer service",
        availableLanguage: "English",
      },
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ContactForm />
    </>
  );
}
