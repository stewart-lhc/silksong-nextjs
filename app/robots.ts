import { MetadataRoute } from 'next';
import { BASE_URL } from '../config/seo';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/*', // Allow API documentation page but block API endpoints
          '/admin/',
          '/_next/',
          '/private/',
          '/components-test', // Hide test pages from crawlers
          '/wcag-demo', // Hide demo pages
          '/theme-demo', // Hide demo pages
          '/color-system-docs/internal', // Allow main docs but block internal
          '/*.json$', // Block direct access to data files
          '/database-setup/', // Block database setup files
          '/scripts/', // Block utility scripts
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: [
          '/api/*',
          '/admin/',
          '/_next/',
          '/private/',
        ],
      },
      {
        userAgent: 'GPTBot',
        allow: [
          '/',
          '/timeline',
          '/platforms', 
          '/checklist',
          '/compare-hollow-knight',
          '/announcement',
          '/news',
          '/guides',
          '/faq',
          '/tools',
          '/developers',
          '/contact',
          '/what-is-silksong',
        ],
        disallow: [
          '/api/',
          '/admin/',
        ],
      },
      {
        userAgent: 'ChatGPT-User',
        allow: [
          '/',
          '/timeline',
          '/platforms',
          '/checklist', 
          '/compare-hollow-knight',
          '/announcement',
          '/news',
          '/guides',
          '/faq',
          '/tools',
          '/developers',
          '/contact',
          '/what-is-silksong',
        ],
        disallow: [
          '/api/',
          '/admin/',
        ],
      },
      {
        userAgent: 'CCBot',
        allow: [
          '/',
          '/faq',
          '/timeline',
          '/announcement',
          '/news',
          '/guides',
          '/what-is-silksong',
        ],
        disallow: [
          '/api/',
          '/admin/',
          '/tools/',
          '/developers/',
        ],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}