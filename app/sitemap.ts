import { MetadataRoute } from 'next';
import { BASE_URL, seoConfigs } from '../config/seo';

export default function sitemap(): MetadataRoute.Sitemap {
  const currentDate = new Date();
  
  // Define all static routes with their priorities and change frequencies
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/timeline`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/checklist`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/platforms`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/faq`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/components-test`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.3,
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