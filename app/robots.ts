import { MetadataRoute } from 'next';
import { BASE_URL } from '../config/seo';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/_next/',
          '/private/',
          '/components-test', // Hide test pages from crawlers
        ],
      },
      {
        userAgent: 'GPTBot',
        disallow: '/', // Disallow AI training crawlers if desired
      },
      {
        userAgent: 'ChatGPT-User',
        disallow: '/',
      },
      {
        userAgent: 'CCBot',
        disallow: '/',
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
    host: BASE_URL,
  };
}