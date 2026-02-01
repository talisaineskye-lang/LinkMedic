/**
 * JSON-LD Structured Data Component
 *
 * Renders structured data for SEO and AI search optimization.
 * Used to add schema.org markup to pages.
 */

interface JsonLdProps {
  data: object | object[];
}

export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

// Pre-built schemas for common use cases

export const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "LinkMedic",
  "url": "https://link-medic.app",
  "logo": "https://link-medic.app/logo.png",
  "description": "Find and fix broken affiliate links in YouTube video descriptions automatically.",
  "foundingDate": "2025",
};

export const softwareApplicationSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "LinkMedic",
  "applicationCategory": "BusinessApplication",
  "operatingSystem": "Web",
  "description": "Automatically scan YouTube video descriptions for broken affiliate links, get AI-powered fix suggestions, and recover lost revenue.",
  "offers": {
    "@type": "AggregateOffer",
    "lowPrice": "0",
    "highPrice": "39",
    "priceCurrency": "USD",
    "offerCount": "3"
  },
};

export const freeAuditToolSchema = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "Free YouTube Affiliate Link Checker",
  "url": "https://link-medic.app/audit",
  "applicationCategory": "UtilityApplication",
  "operatingSystem": "Web",
  "description": "Free tool to scan your YouTube channel for broken affiliate links. No signup required — get results in under 2 minutes.",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD"
  },
  "featureList": [
    "Scan last 15 videos free",
    "No signup or credit card required",
    "Detects broken Amazon, Impact, CJ, Rakuten links",
    "Results in under 2 minutes"
  ]
};

// Helper to create Article schema
export function createArticleSchema({
  headline,
  description,
  datePublished,
  dateModified,
  url,
}: {
  headline: string;
  description: string;
  datePublished: string;
  dateModified?: string;
  url: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": headline,
    "description": description,
    "author": {
      "@type": "Organization",
      "name": "LinkMedic"
    },
    "publisher": {
      "@type": "Organization",
      "name": "LinkMedic",
      "logo": {
        "@type": "ImageObject",
        "url": "https://link-medic.app/logo.png"
      }
    },
    "datePublished": datePublished,
    "dateModified": dateModified || datePublished,
    "mainEntityOfPage": url
  };
}

// Helper to create FAQ schema
export function createFaqSchema(faqs: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };
}
