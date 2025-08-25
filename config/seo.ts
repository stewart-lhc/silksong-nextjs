import { Metadata } from 'next';

// Base website information
const SITE_NAME = "Hollow Knight: Silksong Release Tracker";
const BASE_URL = process.env.NODE_ENV === 'production' 
  ? process.env.NEXT_PUBLIC_SITE_URL || "https://hollowknightsilksong.org"
  : "http://localhost:3000";
const GAME_RELEASE_DATE = "September 4, 2025";

// Common keywords across all pages
const BASE_KEYWORDS = [
  "Hollow Knight Silksong",
  "Team Cherry",
  "metroidvania",
  "indie game",
  "hornet",
  "hollow knight sequel"
];

// Enhanced Next.js Metadata interface for comprehensive SEO
export interface PageSEOConfig extends Metadata {
  structuredData?: Record<string, any>[];
  breadcrumbs?: {
    name: string;
    item: string;
  }[];
  lastModified?: Date;
  changeFreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
}

// Structured data for the website
const createWebsiteStructuredData = (url: string, name: string, description: string) => ({
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": SITE_NAME,
  "url": BASE_URL,
  "description": "The most comprehensive release tracker and information hub for Hollow Knight: Silksong",
  "publisher": {
    "@type": "Organization",
    "name": "Silksong Community",
    "url": BASE_URL
  },
  "potentialAction": {
    "@type": "SearchAction",
    "target": `${BASE_URL}/search?q={search_term_string}`,
    "query-input": "required name=search_term_string"
  }
});

const createVideoGameStructuredData = () => ({
  "@context": "https://schema.org",
  "@type": "VideoGame",
  "name": "Hollow Knight: Silksong",
  "alternateName": "Silksong",
  "description": "A haunting sequel to the acclaimed Hollow Knight, featuring Hornet as the protagonist in a deadly pilgrimage to a kingdom's peak.",
  "genre": ["Metroidvania", "Action", "Adventure", "Indie"],
  "gamePlatform": ["PC", "Steam", "Xbox One", "Xbox Series X", "Xbox Series S", "Game Pass"],
  "developer": {
    "@type": "Organization",
    "name": "Team Cherry",
    "url": "https://www.teamcherry.com.au/",
    "sameAs": [
      "https://x.com/teamcherry",
      "https://www.teamcherry.com.au/"
    ]
  },
  "publisher": {
    "@type": "Organization", 
    "name": "Team Cherry",
    "url": "https://www.teamcherry.com.au/"
  },
  "datePublished": GAME_RELEASE_DATE,
  "applicationCategory": "Game",
  "operatingSystem": ["Windows", "Xbox"],
  "offers": {
    "@type": "Offer",
    "availability": "https://schema.org/PreOrder",
    "availabilityStarts": GAME_RELEASE_DATE,
    "seller": {
      "@type": "Organization",
      "name": "Team Cherry"
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
    "description": "Teen - Fantasy Violence, Mild Language"
  }
});

// SEO configurations for each page
export const seoConfigs: Record<string, PageSEOConfig> = {
  // Home Page (/)
  home: {
    title: "Silksong Release Countdown - September 4, 2025 ⏰",
    description: "Official countdown to Hollow Knight: Silksong release on September 4, 2025. Track Team Cherry's metroidvania sequel with live updates & platform info.",
    keywords: [
      ...BASE_KEYWORDS,
      "September 4 2025",
      "release date",
      "countdown timer",
      "Team Cherry sequel",
      "hornet protagonist",
      "game pass day one"
    ],
    alternates: {
      canonical: BASE_URL,
    },
    openGraph: {
      title: "Silksong Release Countdown - Sept 4, 2025 ✨",
      description: "The ultimate countdown to Hollow Knight: Silksong! Track the September 4, 2025 release with official updates, platform info & community news.",
      type: "website",
      url: BASE_URL,
      siteName: SITE_NAME,
      images: [`${BASE_URL}/pressKit/Silksong_Promo_02_2400.png`]
    },
    twitter: {
      card: "summary_large_image",
      site: "@teamcherry",
      title: "🕷️ Silksong Release: September 4, 2025",
      description: "Official countdown tracker for Hollow Knight: Silksong! Everything you need to know about Team Cherry's highly anticipated sequel.",
      images: [`${BASE_URL}/pressKit/Silksong_Promo_02_2400.png`]
    },
    structuredData: [
      createWebsiteStructuredData(BASE_URL, SITE_NAME, "The most comprehensive release tracker for Hollow Knight: Silksong"),
      createVideoGameStructuredData()
    ]
  },

  // Timeline Page (/timeline)
  timeline: {
    title: "Silksong Timeline - Official Announcements & Updates",
    description: "Complete timeline of Hollow Knight: Silksong announcements from Team Cherry. Track every official update, trailer, and community milestone since 2019.",
    keywords: [
      ...BASE_KEYWORDS,
      "timeline",
      "announcements",
      "updates",
      "news history",
      "Team Cherry updates",
      "development progress"
    ],
    alternates: {
      canonical: `${BASE_URL}/timeline`,
    },
    openGraph: {
      title: "Complete Silksong Timeline - Every Official Update 📅",
      description: "Comprehensive timeline of all Hollow Knight: Silksong announcements, trailers, and updates from Team Cherry since the initial reveal.",
      type: "article",
      url: `${BASE_URL}/timeline`,
      siteName: SITE_NAME
    },
    twitter: {
      card: "summary_large_image",
      title: "📅 Silksong Development Timeline",
      description: "Every major announcement, trailer, and update from Team Cherry's Hollow Knight: Silksong development journey."
    },
    structuredData: [{
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": "Hollow Knight: Silksong Development Timeline",
      "description": "A comprehensive timeline documenting the development and announcements of Hollow Knight: Silksong",
      "author": {
        "@type": "Organization",
        "name": "Silksong Community"
      },
      "publisher": {
        "@type": "Organization",
        "name": SITE_NAME,
        "url": BASE_URL
      },
      "dateModified": new Date().toISOString(),
      "url": `${BASE_URL}/timeline`
    }]
  },

  // Checklist Page (/checklist)
  checklist: {
    title: "Silksong Readiness Checklist - Prepare for Launch Day",
    description: "Essential preparation checklist for Hollow Knight: Silksong launch. Hardware requirements, account setup, lore refresher & community resources for Sept 4, 2025.",
    keywords: [
      ...BASE_KEYWORDS,
      "preparation checklist",
      "launch day",
      "requirements",
      "setup guide",
      "game preparation",
      "hollow knight recap"
    ],
    alternates: {
      canonical: `${BASE_URL}/checklist`,
    },
    openGraph: {
      title: "🎮 Silksong Launch Preparation Checklist",
      description: "Get ready for Hollow Knight: Silksong! Complete preparation guide covering hardware, accounts, lore recap & everything needed for launch day.",
      type: "article",
      url: `${BASE_URL}/checklist`,
      siteName: SITE_NAME
    },
    twitter: {
      card: "summary_large_image", 
      title: "✅ Silksong Launch Day Prep Guide",
      description: "Essential checklist to prepare for Hollow Knight: Silksong release. Hardware, accounts, lore refresher & more!"
    },
    structuredData: [{
      "@context": "https://schema.org",
      "@type": "HowTo",
      "name": "How to Prepare for Hollow Knight: Silksong Launch",
      "description": "A comprehensive checklist to ensure you're fully prepared for the Hollow Knight: Silksong release",
      "totalTime": "PT30M",
      "supply": [
        {
          "@type": "HowToSupply",
          "name": "Gaming PC or Xbox Console"
        },
        {
          "@type": "HowToSupply", 
          "name": "Game Pass Subscription (Optional)"
        }
      ],
      "step": [
        {
          "@type": "HowToStep",
          "name": "Verify System Requirements",
          "text": "Ensure your hardware meets the minimum requirements for Hollow Knight: Silksong"
        },
        {
          "@type": "HowToStep",
          "name": "Set Up Gaming Accounts",
          "text": "Configure Steam, Xbox Game Pass, or platform accounts"
        },
        {
          "@type": "HowToStep",
          "name": "Review Hollow Knight Lore",
          "text": "Refresh your knowledge of the Hollow Knight universe and Hornet's story"
        }
      ]
    }]
  },

  // Platforms Page (/platforms)
  platforms: {
    title: "Silksong Platforms - PC, Xbox, Game Pass Availability",
    description: "Official platform availability for Hollow Knight: Silksong. Confirmed for PC Steam, Xbox One, Xbox Series X|S with Game Pass Day One Sept 4, 2025.",
    keywords: [
      ...BASE_KEYWORDS,
      "platforms",
      "PC Steam",
      "Xbox Game Pass",
      "Xbox Series X",
      "Nintendo Switch",
      "availability",
      "system requirements"
    ],
    alternates: {
      canonical: `${BASE_URL}/platforms`,
    },
    openGraph: {
      title: "🎮 Silksong Platform Availability Guide",
      description: "Complete guide to Hollow Knight: Silksong platform availability. PC, Xbox, Game Pass info, and potential future platform releases.",
      type: "article",
      url: `${BASE_URL}/platforms`,
      siteName: SITE_NAME
    },
    twitter: {
      card: "summary_large_image",
      title: "🎮 Where to Play Silksong",
      description: "Platform availability guide for Hollow Knight: Silksong. PC, Xbox, Game Pass & more!"
    },
    structuredData: [{
      "@context": "https://schema.org",
      "@type": "TechArticle",
      "headline": "Hollow Knight: Silksong Platform Availability",
      "description": "Comprehensive guide to platform availability and system requirements for Hollow Knight: Silksong",
      "author": {
        "@type": "Organization",
        "name": "Silksong Community"
      },
      "publisher": {
        "@type": "Organization",
        "name": SITE_NAME,
        "url": BASE_URL
      },
      "dateModified": new Date().toISOString(),
      "url": `${BASE_URL}/platforms`
    }]
  },

  // FAQ Page (/faq)
  faq: {
    title: "Silksong FAQ - Release Date, Gameplay & Platform Questions",
    description: "Frequently asked questions about Hollow Knight: Silksong. Release info Sept 4 2025, gameplay details, platform availability & system requirements.",
    keywords: [
      ...BASE_KEYWORDS,
      "FAQ",
      "frequently asked questions",
      "release info",
      "gameplay questions",
      "Team Cherry answers",
      "silksong guide"
    ],
    alternates: {
      canonical: `${BASE_URL}/faq`,
    },
    openGraph: {
      title: "❓ Silksong FAQ - All Your Questions Answered",
      description: "Comprehensive FAQ covering everything about Hollow Knight: Silksong - release details, gameplay, platforms & more.",
      type: "article",
      url: `${BASE_URL}/faq`,
      siteName: SITE_NAME
    },
    twitter: {
      card: "summary_large_image",
      title: "❓ Silksong Questions Answered",
      description: "Get answers to the most common questions about Hollow Knight: Silksong release, gameplay & platforms."
    },
    structuredData: [{
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "When will Hollow Knight: Silksong be released?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Hollow Knight: Silksong will be released on September 4, 2025, as officially confirmed by Team Cherry."
          }
        },
        {
          "@type": "Question", 
          "name": "What platforms will Silksong be available on?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Silksong is officially confirmed for PC (Steam, Windows Store), Xbox One, and Xbox Series X|S with Game Pass support from day one."
          }
        },
        {
          "@type": "Question",
          "name": "Will Silksong be free for Hollow Knight owners?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "No, Silksong is a full standalone sequel that will be sold separately. However, it will be available on Xbox Game Pass from release day."
          }
        }
      ]
    }]
  }
};

// Helper function to get SEO config by route
export const getSEOConfig = (route: string): PageSEOConfig => {
  const routeMap: Record<string, string> = {
    "/": "home",
    "/timeline": "timeline", 
    "/checklist": "checklist",
    "/platforms": "platforms",
    "/faq": "faq"
  };

  const configKey = routeMap[route] || "home";
  return seoConfigs[configKey];
};

// Enhanced metadata generator with viewport, verification, and additional features
export function generateEnhancedMetadata(config: PageSEOConfig): Metadata {
  return {
    ...config,
    metadataBase: new URL(BASE_URL),
    viewport: {
      width: 'device-width',
      initialScale: 1,
      maximumScale: 5,
      userScalable: true,
    },
    verification: {
      google: 'your-google-verification-code',
      yandex: 'your-yandex-verification-code',
      // bing: 'your-bing-verification-code', // Not supported in Next.js 15
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    category: 'gaming',
    classification: 'Game Information',
    creator: 'Team Cherry Fan Community',
    publisher: 'Silksong Community',
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    manifest: '/manifest.json',
    icons: {
      icon: [
        { url: '/favicon.ico', sizes: 'any' },
        { url: '/icon.svg', type: 'image/svg+xml' },
      ],
      apple: [
        { url: '/apple-icon.png', sizes: '180x180', type: 'image/png' },
      ],
    },
    other: {
      'theme-color': '#000000',
      'color-scheme': 'dark light',
      'twitter:app:name:iphone': SITE_NAME,
      'twitter:app:name:googleplay': SITE_NAME,
      'apple-mobile-web-app-capable': 'yes',
      'apple-mobile-web-app-status-bar-style': 'black-translucent',
      'apple-mobile-web-app-title': SITE_NAME,
      'application-name': SITE_NAME,
      'msapplication-TileColor': '#000000',
      'msapplication-config': '/browserconfig.xml',
    },
  };
}

// Enhanced SEO configuration with additional metadata
Object.keys(seoConfigs).forEach(key => {
  const config = seoConfigs[key];
  
  // Add breadcrumbs based on page type
  if (key !== 'home') {
    config.breadcrumbs = [
      { name: 'Home', item: BASE_URL },
      { name: (typeof config.title === 'string' ? config.title.split(' - ')[0] : 'Page') || 'Page', item: (typeof config.alternates?.canonical === 'string' ? config.alternates.canonical : BASE_URL) }
    ];
  }
  
  // Add change frequency and priority
  config.changeFreq = key === 'home' ? 'daily' : 'weekly';
  config.priority = key === 'home' ? 1.0 : 0.8;
  config.lastModified = new Date();
});

// Export individual configs for direct import
export const homeSEO = seoConfigs.home;
export const timelineSEO = seoConfigs.timeline;
export const checklistSEO = seoConfigs.checklist;
export const platformsSEO = seoConfigs.platforms;
export const faqSEO = seoConfigs.faq;

// Export constants for reuse
export { SITE_NAME, BASE_URL, GAME_RELEASE_DATE, BASE_KEYWORDS };

// Additional SEO utilities
export const DEFAULT_LOCALE = 'en';
export const SUPPORTED_LOCALES = ['en'];
export const DOMAIN_VERIFICATION = {
  google: 'your-google-verification-code',
  bing: 'your-bing-verification-code',
  yandex: 'your-yandex-verification-code',
};