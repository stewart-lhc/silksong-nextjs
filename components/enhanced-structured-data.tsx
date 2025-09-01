import { BASE_URL, GAME_RELEASE_DATE } from '../config/seo';

interface JsonLdSchema {
  '@context': string;
  '@type': string;
  [key: string]: unknown;
}

interface StructuredDataProps {
  schema: JsonLdSchema;
}

export function StructuredData({ schema }: StructuredDataProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schema)
      }}
    />
  );
}

// HowTo Schema for Checklist Page - Updated for actual checklist structure
export const createHowToSchema = (checklistData: Array<{
  id: string;
  title: string;
  description: string;
  items: Array<{ id: string; text: string; completed: boolean }>;
}>) => ({
  "@context": "https://schema.org",
  "@type": "HowTo",
  "name": "How to Prepare for Hollow Knight: Silksong Launch",
  "description": "Complete preparation guide to ensure you're ready for Hollow Knight: Silksong release on September 4, 2025",
  "totalTime": "PT45M",
  "estimatedCost": {
    "@type": "MonetaryAmount",
    "currency": "USD",
    "value": "0"
  },
  "supply": [
    {
      "@type": "HowToSupply",
      "name": "Gaming PC or Xbox Console"
    },
    {
      "@type": "HowToSupply",
      "name": "Game Pass Subscription (Optional)"
    },
    {
      "@type": "HowToSupply",
      "name": "Steam Account (PC Players)"
    }
  ],
  "tool": [
    {
      "@type": "HowToTool",
      "name": "Web Browser"
    },
    {
      "@type": "HowToTool", 
      "name": "Gaming Platform Account"
    }
  ],
  "step": checklistData.map((category, index) => ({
    "@type": "HowToStep",
    "position": index + 1,
    "name": category.title,
    "text": category.description,
    "url": `${BASE_URL}/checklist#${category.id}`,
    "substeps": category.items.slice(0, 3).map((item) => ({
      "@type": "HowToDirection",
      "text": item.text
    }))
  })),
  "about": {
    "@type": "VideoGame",
    "name": "Hollow Knight: Silksong",
    "datePublished": GAME_RELEASE_DATE
  }
});

// Comparison Table Schema for Compare Page  
export const createComparisonSchema = (comparisons: Array<{
  dimension: string;
  hollowKnight: string;
  silksong: string;
  status: string;
}>) => ({
  "@context": "https://schema.org",
  "@type": "Article", 
  "headline": "Hollow Knight vs Silksong: Complete Feature Comparison",
  "description": "Comprehensive side-by-side comparison of gameplay mechanics, features, and confirmed differences between Hollow Knight and its sequel Silksong",
  "author": {
    "@type": "Organization",
    "name": "Silksong Community"
  },
  "publisher": {
    "@type": "Organization",
    "name": "Silksong Release Tracker",
    "url": BASE_URL
  },
  "dateModified": new Date().toISOString(),
  "datePublished": "2024-01-01T00:00:00Z",
  "mainEntityOfPage": `${BASE_URL}/compare-hollow-knight`,
  "articleSection": "Gaming Guide",
  "wordCount": 2500,
  "about": [
    {
      "@type": "VideoGame",
      "name": "Hollow Knight",
      "developer": "Team Cherry"
    },
    {
      "@type": "VideoGame", 
      "name": "Hollow Knight: Silksong",
      "developer": "Team Cherry",
      "datePublished": GAME_RELEASE_DATE
    }
  ],
  "mentions": comparisons.map(comp => ({
    "@type": "Thing",
    "name": comp.dimension,
    "description": `Comparison between ${comp.hollowKnight} and ${comp.silksong}`
  }))
});

// Timeline Schema for Development Timeline
export const createTimelineSchema = (events: Array<{
  date: string;
  title: string;
  description: string;
  type: string;
}>) => ({
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "Hollow Knight: Silksong Development Timeline",
  "description": "Complete chronological timeline of Hollow Knight: Silksong announcements, updates, and development milestones from Team Cherry",
  "author": {
    "@type": "Organization", 
    "name": "Silksong Community"
  },
  "publisher": {
    "@type": "Organization",
    "name": "Silksong Release Tracker",
    "url": BASE_URL
  },
  "dateModified": new Date().toISOString(),
  "datePublished": "2024-01-01T00:00:00Z", 
  "mainEntityOfPage": `${BASE_URL}/timeline`,
  "articleSection": "Gaming News",
  "about": {
    "@type": "VideoGame",
    "name": "Hollow Knight: Silksong",
    "developer": {
      "@type": "Organization",
      "name": "Team Cherry",
      "url": "https://www.teamcherry.com.au/"
    },
    "datePublished": GAME_RELEASE_DATE
  },
  "timeline": events.map((event) => ({
    "@type": "Event",
    "name": event.title,
    "description": event.description,
    "startDate": event.date,
    "eventStatus": "https://schema.org/EventScheduled",
    "about": {
      "@type": "VideoGame",
      "name": "Hollow Knight: Silksong"
    }
  }))
});

// Platform Availability Schema
export const createPlatformSchema = (platforms: Array<{
  name: string;
  status: string;
  gamePassIncluded?: boolean;
  officialUrl?: string;
}>) => ({
  "@context": "https://schema.org",
  "@type": "TechArticle",
  "headline": "Hollow Knight: Silksong Platform Availability Guide",
  "description": "Complete guide to platform availability, system requirements, and Game Pass information for Hollow Knight: Silksong",
  "author": {
    "@type": "Organization",
    "name": "Silksong Community" 
  },
  "publisher": {
    "@type": "Organization",
    "name": "Silksong Release Tracker",
    "url": BASE_URL
  },
  "dateModified": new Date().toISOString(),
  "mainEntityOfPage": `${BASE_URL}/platforms`,
  "about": {
    "@type": "VideoGame",
    "name": "Hollow Knight: Silksong",
    "gamePlatform": platforms
      .filter(p => p.status === 'confirmed')
      .map(p => p.name),
    "datePublished": GAME_RELEASE_DATE
  },
  "mentions": platforms.map(platform => ({
    "@type": "SoftwareApplication",
    "name": platform.name,
    "applicationCategory": "Game Platform",
    "operatingSystem": platform.name.includes('Xbox') ? 'Xbox OS' : 
                     platform.name.includes('PC') || platform.name.includes('Steam') ? 'Windows' :
                     platform.name.includes('Switch') ? 'Nintendo Switch OS' : 'Multi-platform'
  }))
});

// Enhanced FAQ Schema with Categories - Updated for actual FAQ data structure
export const createEnhancedFAQSchema = (faqItems: Array<{
  id: string;
  question: string;
  answer: string;
  category: string;
  lastUpdated?: string;
}>) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "name": "Hollow Knight: Silksong Frequently Asked Questions",
  "description": "Comprehensive FAQ covering release date, platforms, gameplay, and everything about Hollow Knight: Silksong",
  "url": `${BASE_URL}/faq`,
  "dateModified": new Date().toISOString(),
  "about": {
    "@type": "VideoGame",
    "name": "Hollow Knight: Silksong",
    "developer": {
      "@type": "Organization",
      "name": "Team Cherry",
      "url": "https://www.teamcherry.com.au/"
    },
    "datePublished": GAME_RELEASE_DATE,
    "gamePlatform": ["PC", "Xbox Series X", "Xbox Series S", "Xbox One"],
    "genre": ["Metroidvania", "Action-Adventure", "Platformer"]
  },
  "mainEntity": faqItems.map((qa) => ({
    "@type": "Question", 
    "name": qa.question,
    "answerCount": 1,
    "acceptedAnswer": {
      "@type": "Answer",
      "text": qa.answer,
      "dateCreated": qa.lastUpdated ? new Date(qa.lastUpdated).toISOString() : new Date().toISOString(),
      "upvoteCount": 1,
      "author": {
        "@type": "Organization",
        "name": "Silksong Community"
      }
    },
    "about": {
      "@type": "VideoGame",
      "name": "Hollow Knight: Silksong"
    }
  }))
});

// Website Search Schema
export const createSearchSchema = () => ({
  "@context": "https://schema.org",
  "@type": "WebSite",
  "url": BASE_URL,
  "potentialAction": {
    "@type": "SearchAction",
    "target": {
      "@type": "EntryPoint",
      "urlTemplate": `${BASE_URL}/search?q={search_term_string}`
    },
    "query-input": "required name=search_term_string"
  }
});

// Video Game Release Event Schema
export const createReleaseEventSchema = () => ({
  "@context": "https://schema.org",
  "@type": "Event",
  "name": "Hollow Knight: Silksong Release",
  "startDate": GAME_RELEASE_DATE,
  "eventStatus": "https://schema.org/EventScheduled",
  "eventAttendanceMode": "https://schema.org/OnlineEventAttendanceMode",
  "location": {
    "@type": "VirtualLocation",
    "url": BASE_URL
  },
  "description": "The official release of Hollow Knight: Silksong, the highly anticipated sequel to the acclaimed Hollow Knight",
  "organizer": {
    "@type": "Organization",
    "name": "Team Cherry",
    "url": "https://www.teamcherry.com.au/"
  },
  "offers": {
    "@type": "Offer",
    "url": "https://store.steampowered.com/app/1030300",
    "price": "TBA",
    "priceCurrency": "USD",
    "availability": "https://schema.org/PreOrder",
    "validFrom": GAME_RELEASE_DATE
  },
  "about": {
    "@type": "VideoGame",
    "name": "Hollow Knight: Silksong"
  }
});

// Export all schemas for easy import
export {
  StructuredData as default
};