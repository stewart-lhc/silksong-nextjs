import { MetadataRoute } from 'next';
import { BASE_URL, seoConfigs } from '../config/seo';

export default function sitemap(): MetadataRoute.Sitemap {
  // Use August 2025 dates to reflect recent updates
  const recentUpdate = new Date('2025-08-25');
  const homeUpdate = new Date('2025-08-25'); // Homepage updated most recently
  
  // Define all static routes with their priorities and change frequencies
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: homeUpdate,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/timeline`,
      lastModified: recentUpdate,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/platforms`,
      lastModified: recentUpdate,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/checklist`,
      lastModified: recentUpdate,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/compare-hollow-knight`,
      lastModified: recentUpdate,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/faq`,
      lastModified: new Date('2025-08-21'), // FAQ specifically updated on Aug 21, 2025
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/tools`,
      lastModified: recentUpdate,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/tools/embed`,
      lastModified: recentUpdate,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/developers`,
      lastModified: recentUpdate,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
  ];

  // Add any additional routes that might be generated dynamically
  // This is where you would add blog posts, news articles, etc.
  const dynamicRoutes: MetadataRoute.Sitemap = [
    // Future: Add dynamic content routes here
    // Example:
    // ...newsArticles.map(article => ({
    //   url: `${BASE_URL}/news/${article.slug}`,
    //   lastModified: article.updatedAt,
    //   changeFrequency: 'monthly' as const,
    //   priority: 0.6,
    // })),
  ];

  return [...staticRoutes, ...dynamicRoutes];
}