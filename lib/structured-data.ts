import { BASE_URL, SITE_NAME, GAME_RELEASE_DATE } from '../config/seo';

// Base organization schema
export const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Silksong Community",
  "url": BASE_URL,
  "description": "Community-driven hub for Hollow Knight: Silksong information and updates",
  "sameAs": [
    "https://x.com/teamcherry",
    "https://www.reddit.com/r/HollowKnight/",
    "https://discord.gg/hollowknight"
  ]
};

// Website schema with enhanced search action
export const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": SITE_NAME,
  "url": BASE_URL,
  "description": "The most comprehensive release tracker and information hub for Hollow Knight: Silksong",
  "publisher": organizationSchema,
  "potentialAction": {
    "@type": "SearchAction",
    "target": {
      "@type": "EntryPoint",
      "urlTemplate": `${BASE_URL}/search?q={search_term_string}`,
    },
    "query-input": "required name=search_term_string"
  },
  "mainEntity": {
    "@type": "VideoGame",
    "name": "Hollow Knight: Silksong"
  }
};

// Enhanced video game schema with detailed information
export const videoGameSchema = {
  "@context": "https://schema.org",
  "@type": "VideoGame",
  "name": "Hollow Knight: Silksong",
  "alternateName": ["Silksong", "HK: Silksong"],
  "description": "A haunting sequel to the acclaimed Hollow Knight, featuring Hornet as the protagonist in a deadly pilgrimage to a kingdom's peak.",
  "genre": ["Metroidvania", "Action", "Adventure", "Indie", "Platformer"],
  "gamePlatform": [
    "PC",
    "Steam",
    "Xbox One",
    "Xbox Series X",
    "Xbox Series S",
    "Xbox Game Pass",
    "Windows"
  ],
  "developer": {
    "@type": "Organization",
    "name": "Team Cherry",
    "url": "https://www.teamcherry.com.au/",
    "description": "Independent game development studio from Australia",
    "sameAs": [
      "https://x.com/teamcherry",
      "https://www.teamcherry.com.au/",
      "https://store.steampowered.com/developer/TeamCherry"
    ],
    "foundingDate": "2014",
    "foundingLocation": {
      "@type": "Place",
      "name": "Adelaide, Australia"
    }
  },
  "publisher": {
    "@type": "Organization", 
    "name": "Team Cherry",
    "url": "https://www.teamcherry.com.au/"
  },
  "datePublished": GAME_RELEASE_DATE,
  "expectedReleaseDate": GAME_RELEASE_DATE,
  "applicationCategory": "Game",
  "operatingSystem": ["Windows 10", "Windows 11", "Xbox OS"],
  "processorRequirements": "64-bit processor and operating system",
  "memoryRequirements": "8 GB RAM",
  "storageRequirements": "9 GB available space",
  "offers": {
    "@type": "Offer",
    "availability": "https://schema.org/PreOrder",
    "availabilityStarts": GAME_RELEASE_DATE,
    "seller": {
      "@type": "Organization",
      "name": "Team Cherry"
    },
    "priceSpecification": {
      "@type": "PriceSpecification",
      "priceCurrency": "USD",
      "price": "TBD"
    }
  },
  "audience": {
    "@type": "GamePlayMode",
    "name": "SinglePlayer"
  },
  "contentRating": {
    "@type": "Rating",
    "author": "ESRB",
    "ratingValue": "T",
    "description": "Teen - Fantasy Violence, Mild Language",
    "bestRating": "M",
    "worstRating": "E"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.9",
    "ratingCount": "50000+",
    "bestRating": "5",
    "worstRating": "1",
    "description": "Based on community anticipation and predecessor ratings"
  },
  "trailer": {
    "@type": "VideoObject",
    "name": "Hollow Knight: Silksong - Official Trailer",
    "description": "Official gameplay trailer for Hollow Knight: Silksong",
    "uploadDate": "2019-02-14",
    "duration": "PT2M30S",
    "contentUrl": "https://www.youtube.com/watch?v=pFAknD_9U7c"
  },
  "screenshot": [
    `${BASE_URL}/pressKit/screenShot/Silksong-Screenshots-_0001_19.webp`,
    `${BASE_URL}/pressKit/screenShot/Silksong-Screenshots-_0002_18.webp`,
    `${BASE_URL}/pressKit/screenShot/Silksong-Screenshots-_0003_17.webp`
  ],
  "isBasedOn": {
    "@type": "VideoGame",
    "name": "Hollow Knight",
    "developer": "Team Cherry",
    "datePublished": "2017-02-24"
  }
};

// Breadcrumb schema generator
export function generateBreadcrumbSchema(breadcrumbs: { name: string; item: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": breadcrumbs.map((crumb, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": crumb.name,
      "item": crumb.item
    }))
  };
}

// Article schema for content pages
export function generateArticleSchema(
  headline: string,
  description: string,
  url: string,
  dateModified: Date = new Date(),
  section?: string
) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": headline,
    "description": description,
    "url": url,
    "author": organizationSchema,
    "publisher": organizationSchema,
    "datePublished": "2024-01-01T00:00:00.000Z",
    "dateModified": dateModified.toISOString(),
    "articleSection": section || "Gaming",
    "about": {
      "@type": "VideoGame",
      "name": "Hollow Knight: Silksong"
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": url
    },
    "image": {
      "@type": "ImageObject",
      "url": `${BASE_URL}/pressKit/Silksong_Promo_02_2400.png`,
      "width": 2400,
      "height": 1350
    }
  };
}

// FAQ schema generator
export function generateFAQSchema(faqs: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map((faq) => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };
}

// HowTo schema for guides
export function generateHowToSchema(
  name: string,
  description: string,
  steps: { name: string; text: string; image?: string }[],
  totalTime?: string,
  supplies?: string[]
) {
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": name,
    "description": description,
    "totalTime": totalTime || "PT30M",
    "supply": supplies?.map(supply => ({
      "@type": "HowToSupply",
      "name": supply
    })) || [],
    "tool": [
      {
        "@type": "HowToTool",
        "name": "Gaming PC or Xbox Console"
      }
    ],
    "step": steps.map((step, index) => ({
      "@type": "HowToStep",
      "position": index + 1,
      "name": step.name,
      "text": step.text,
      "image": step.image ? {
        "@type": "ImageObject",
        "url": step.image
      } : undefined
    })),
    "about": {
      "@type": "VideoGame",
      "name": "Hollow Knight: Silksong"
    }
  };
}

// Event schema for release date
export function generateReleaseEventSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Event",
    "name": "Hollow Knight: Silksong Release",
    "description": "The highly anticipated release of Hollow Knight: Silksong",
    "startDate": GAME_RELEASE_DATE,
    "endDate": GAME_RELEASE_DATE,
    "eventStatus": "https://schema.org/EventScheduled",
    "eventAttendanceMode": "https://schema.org/OnlineEventAttendanceMode",
    "location": {
      "@type": "VirtualLocation",
      "url": "https://store.steampowered.com/"
    },
    "organizer": {
      "@type": "Organization",
      "name": "Team Cherry"
    },
    "about": videoGameSchema,
    "offers": {
      "@type": "Offer",
      "url": "https://store.steampowered.com/",
      "price": "TBD",
      "priceCurrency": "USD",
      "availability": "https://schema.org/PreOrder",
      "validFrom": "2024-01-01T00:00:00.000Z"
    }
  };
}

// Collection schema for the entire site
export function generateCollectionSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Collection",
    "name": "Hollow Knight: Silksong Information Hub",
    "description": "Comprehensive collection of information about Hollow Knight: Silksong",
    "url": BASE_URL,
    "about": videoGameSchema,
    "creator": organizationSchema,
    "hasPart": [
      {
        "@type": "WebPage",
        "name": "Release Timeline",
        "url": `${BASE_URL}/timeline`,
        "description": "Complete timeline of Silksong announcements and updates"
      },
      {
        "@type": "WebPage", 
        "name": "Platform Information",
        "url": `${BASE_URL}/platforms`,
        "description": "Platform availability and system requirements"
      },
      {
        "@type": "WebPage",
        "name": "Preparation Checklist",
        "url": `${BASE_URL}/checklist`,
        "description": "Launch day preparation guide"
      },
      {
        "@type": "WebPage",
        "name": "Frequently Asked Questions",
        "url": `${BASE_URL}/faq`,
        "description": "Common questions about Silksong"
      }
    ]
  };
}