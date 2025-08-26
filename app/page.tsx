import { redirect } from 'next/navigation';
import { i18nConfig } from '@/i18n/config';

// Root page redirects to default locale
export default function RootPage() {
  redirect(`/${i18nConfig.defaultLocale}`);
}