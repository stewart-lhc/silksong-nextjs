/**
 * Basic Integration Example
 * Shows the simplest way to integrate newsletter functionality
 */

import { NewsletterForm, NewsletterCount } from '@silksong/newsletter-kit';

export default function BasicIntegrationPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-md mx-auto text-center">
        <h1 className="text-3xl font-bold mb-2">Stay in Touch</h1>
        <p className="text-gray-600 mb-6">
          Subscribe to get updates about our latest features and releases.
        </p>
        
        {/* Basic newsletter form */}
        <NewsletterForm 
          showCount={true}
          onSuccess={(data) => {
            console.log('New subscriber:', data);
          }}
        />
        
        {/* Show current subscriber count */}
        <div className="mt-4">
          <NewsletterCount className="text-sm text-gray-500" />
        </div>
      </div>
    </div>
  );
}