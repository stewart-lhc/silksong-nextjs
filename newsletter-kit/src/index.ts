/**
 * @silksong/newsletter-kit
 * Drop-in newsletter subscription component for Next.js projects
 */

// Core hooks and components
export { useEmailSubscription } from './hooks/useEmailSubscription';
export { NewsletterForm } from './components/NewsletterForm';
export { NewsletterProvider } from './components/NewsletterProvider';
export { NewsletterCount } from './components/NewsletterCount';

// Styled variants
export { NewsletterFormMinimal } from './components/variants/NewsletterFormMinimal';
export { NewsletterFormInline } from './components/variants/NewsletterFormInline';
export { NewsletterFormModal } from './components/variants/NewsletterFormModal';
export { NewsletterFormHero } from './components/variants/NewsletterFormHero';

// API utilities
export { createNewsletterAPI } from './api/createNewsletterAPI';
export { createSubscribeRoute } from './api/createSubscribeRoute';
export { createCountRoute } from './api/createCountRoute';

// Configuration and types
export type { 
  NewsletterConfig, 
  NewsletterTheme,
  SubscriptionData,
  NewsletterFormProps,
  NewsletterHookReturn 
} from './types';

// Database utilities
export { createNewsletterTable } from './utils/database';
export { validateSupabaseConfig } from './utils/validation';

// Style utilities  
export { newsletterStyles } from './styles';
export { cn } from './utils/cn';

// Constants
export { DEFAULT_CONFIG } from './config/defaults';