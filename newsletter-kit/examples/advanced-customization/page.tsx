/**
 * Advanced Customization Example
 * Shows how to use themes, custom validation, and advanced features
 */

import { 
  NewsletterProvider, 
  NewsletterFormHero, 
  NewsletterFormInline,
  NewsletterFormModal,
  NewsletterCount,
  themes 
} from '@silksong/newsletter-kit';
import { useState } from 'react';

// Custom configuration
const customConfig = {
  theme: {
    ...themes.modern,
    colors: {
      ...themes.modern.colors,
      primary: '#8b5cf6', // Purple accent
    }
  },
  messages: {
    success: 'Welcome to our community! 🎉',
    placeholder: 'Your email address...',
    submitButton: 'Join Now',
    loadingButton: 'Joining...'
  },
  rateLimit: {
    maxRequests: 3,
    windowMs: 5 * 60 * 1000, // 5 minutes
  }
};

// Custom validation function
const customValidation = (email: string) => {
  // Block certain domains
  const blockedDomains = ['tempmail.com', '10minutemail.com'];
  const domain = email.split('@')[1]?.toLowerCase();
  
  if (blockedDomains.includes(domain)) {
    return {
      isValid: false,
      error: 'Please use a permanent email address'
    };
  }
  
  // Require corporate emails for this example
  const corporateDomains = ['.com', '.org', '.net', '.edu'];
  const hasCorporateDomain = corporateDomains.some(d => domain?.endsWith(d));
  
  if (!hasCorporateDomain) {
    return {
      isValid: false,  
      error: 'Please use a corporate email address'
    };
  }
  
  return { isValid: true };
};

export default function AdvancedCustomizationPage() {
  const [currentTheme, setCurrentTheme] = useState('modern');
  
  return (
    <NewsletterProvider config={customConfig}>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
        
        {/* Hero Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <NewsletterFormHero
              title="Join Our Developer Community"
              description="Get exclusive insights, early access to new features, and connect with fellow developers."
              showCount={true}
              size="lg"
              customValidation={customValidation}
              onSuccess={(data) => {
                // Custom success handling
                console.log('New subscriber:', data);
                
                // Track conversion (example)
                if (typeof window !== 'undefined' && window.gtag) {
                  window.gtag('event', 'newsletter_signup', {
                    event_category: 'engagement',
                    event_label: 'hero_form'
                  });
                }
              }}
              source="hero_section"
            />
          </div>
        </section>
        
        {/* Features Section */}
        <section className="py-16 bg-white/60 backdrop-blur">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">
              What You'll Get
            </h2>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center p-6">
                <div className="w-16 h-16 bg-purple-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                  📚
                </div>
                <h3 className="font-semibold mb-2">Weekly Tutorials</h3>
                <p className="text-gray-600">In-depth guides and best practices</p>
              </div>
              
              <div className="text-center p-6">
                <div className="w-16 h-16 bg-purple-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                  🚀
                </div>
                <h3 className="font-semibold mb-2">Early Access</h3>
                <p className="text-gray-600">Be first to try new features</p>
              </div>
              
              <div className="text-center p-6">
                <div className="w-16 h-16 bg-purple-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                  💬
                </div>
                <h3 className="font-semibold mb-2">Community</h3>
                <p className="text-gray-600">Connect with fellow developers</p>
              </div>
            </div>
          </div>
        </section>
        
        {/* Inline Form Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-8 text-white text-center">
              <h2 className="text-2xl font-bold mb-4">
                Don't Miss Our Updates
              </h2>
              <p className="mb-6 opacity-90">
                Join <NewsletterCount className="font-semibold" /> other developers
              </p>
              
              <NewsletterFormInline
                variant="ghost"
                className="max-w-md mx-auto"
                placeholder="Your work email..."
                submitText="Subscribe"
                customValidation={customValidation}
                source="cta_section"
              />
            </div>
          </div>
        </section>
        
        {/* Modal Trigger */}
        <section className="py-16 text-center">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold mb-4">
              Still Not Convinced?
            </h2>
            <p className="text-gray-600 mb-8">
              Check out what's included in our newsletter
            </p>
            
            <NewsletterFormModal
              trigger={
                <button className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-lg font-medium transition-colors">
                  See What's Inside
                </button>
              }
              title="Newsletter Preview"
              description="Here's what you can expect in your inbox:"
              showCount={true}
              customValidation={customValidation}
              source="modal_form"
            />
          </div>
        </section>
        
        {/* Theme Switcher (for demo) */}
        <section className="py-8 bg-gray-50">
          <div className="container mx-auto px-4 text-center">
            <p className="text-sm text-gray-600 mb-4">
              Theme Demo (this would not be in production):
            </p>
            <div className="flex justify-center space-x-2">
              {Object.keys(themes).map((themeName) => (
                <button
                  key={themeName}
                  onClick={() => setCurrentTheme(themeName)}
                  className={`px-3 py-1 text-xs rounded ${
                    currentTheme === themeName 
                      ? 'bg-purple-600 text-white' 
                      : 'bg-white text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {themeName}
                </button>
              ))}
            </div>
          </div>
        </section>
        
      </div>
    </NewsletterProvider>
  );
}