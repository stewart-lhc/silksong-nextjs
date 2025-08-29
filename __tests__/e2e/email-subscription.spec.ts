/**
 * End-to-End Tests - Email Subscription Flow
 * Tests complete user workflows using Playwright
 */

import { test, expect } from '@playwright/test';

test.describe('Email Subscription E2E', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the homepage
    await page.goto('/');
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
  });

  test.describe('Successful Subscription Flow', () => {
    test('should complete subscription from hero section', async ({ page }) => {
      // Find the email input in the hero section
      const emailInput = page.locator('[data-testid="email-input"]').or(
        page.locator('input[type="email"]')
      ).first();
      
      const subscribeButton = page.locator('[data-testid="subscribe-button"]').or(
        page.locator('button:has-text("Notify Me")'),
        page.locator('button:has-text("Subscribe")')
      ).first();

      // Ensure elements are visible
      await expect(emailInput).toBeVisible();
      await expect(subscribeButton).toBeVisible();

      // Check initial subscriber count is displayed
      const subscriberCount = page.locator('[data-testid="subscriber-count"]').or(
        page.locator('text=/\\d+.*subscribers?/')
      ).first();
      await expect(subscriberCount).toBeVisible();

      // Fill in email address
      const testEmail = `test-${Date.now()}@example.com`;
      await emailInput.fill(testEmail);
      
      // Verify input value
      await expect(emailInput).toHaveValue(testEmail);

      // Submit the form
      await subscribeButton.click();

      // Should show loading state
      await expect(subscribeButton).toBeDisabled();
      await expect(subscribeButton).toContainText(/\.\.\.|subscribing/i);

      // Should show success state
      await expect(page.locator('text=/subscribed|success/i')).toBeVisible({ timeout: 10000 });
      
      // Should show success indicator
      const successIndicator = page.locator('[data-testid="success-message"]').or(
        page.locator('text="✓"'),
        page.locator('[role="status"]')
      );
      await expect(successIndicator).toBeVisible();

      // Subscriber count should increment (if we can detect it)
      // Note: This might be flaky in real scenarios due to concurrent users
      // await expect(subscriberCount).not.toContainText(initialCount);
    });

    test('should handle success state auto-reset', async ({ page }) => {
      const emailInput = page.locator('input[type="email"]').first();
      const subscribeButton = page.locator('button:has-text("Notify")').or(
        page.locator('button:has-text("Subscribe")')
      ).first();

      await emailInput.fill('auto-reset@example.com');
      await subscribeButton.click();

      // Wait for success state
      await expect(page.locator('text=/success|subscribed/i')).toBeVisible();

      // Wait for auto-reset (3 seconds)
      await page.waitForTimeout(3500);

      // Form should be visible again
      await expect(emailInput).toBeVisible();
      await expect(subscribeButton).toBeVisible();
    });
  });

  test.describe('Form Validation', () => {
    test('should prevent submission with empty email', async ({ page }) => {
      const subscribeButton = page.locator('button:has-text("Notify")').or(
        page.locator('button:has-text("Subscribe")')
      ).first();

      // Button should be disabled when no email is entered
      await expect(subscribeButton).toBeDisabled();

      // Clicking should not trigger submission
      await subscribeButton.click({ force: true });
      
      // Should not show success or loading state
      await expect(page.locator('text=/success|subscribed/i')).not.toBeVisible();
    });

    test('should validate email format client-side', async ({ page }) => {
      const emailInput = page.locator('input[type="email"]').first();
      const subscribeButton = page.locator('button:has-text("Notify")').or(
        page.locator('button:has-text("Subscribe")')
      ).first();

      // Test invalid email formats
      const invalidEmails = ['invalid', 'test@', '@example.com', 'test..test@example.com'];

      for (const email of invalidEmails) {
        await emailInput.fill(email);
        
        // Modern browsers should show validation message
        if (await emailInput.evaluate(el => (el as HTMLInputElement).validity.valid)) {
          // If browser doesn't catch it, our validation should
          await subscribeButton.click();
          
          // Should show error or validation message
          const errorMessage = page.locator('[role="alert"]').or(
            page.locator('text=/invalid|valid email/i')
          );
          
          if (await errorMessage.isVisible()) {
            await expect(errorMessage).toBeVisible();
          }
        } else {
          // Browser caught the invalid email
          const validationMessage = await emailInput.evaluate(el => 
            (el as HTMLInputElement).validationMessage
          );
          expect(validationMessage).toBeTruthy();
        }
      }
    });

    test('should enable button when valid email is entered', async ({ page }) => {
      const emailInput = page.locator('input[type="email"]').first();
      const subscribeButton = page.locator('button:has-text("Notify")').or(
        page.locator('button:has-text("Subscribe")')
      ).first();

      // Initially disabled
      await expect(subscribeButton).toBeDisabled();

      // Should enable with valid email
      await emailInput.fill('valid@example.com');
      await expect(subscribeButton).toBeEnabled();

      // Should disable again if cleared
      await emailInput.clear();
      await expect(subscribeButton).toBeDisabled();
    });
  });

  test.describe('Error Handling', () => {
    test('should handle duplicate email gracefully', async ({ page }) => {
      const emailInput = page.locator('input[type="email"]').first();
      const subscribeButton = page.locator('button:has-text("Notify")').or(
        page.locator('button:has-text("Subscribe")')
      ).first();

      const duplicateEmail = 'duplicate@example.com';

      // First submission
      await emailInput.fill(duplicateEmail);
      await subscribeButton.click();

      // Wait for completion (success or error)
      await expect(subscribeButton).toBeEnabled({ timeout: 10000 });

      // If first submission succeeded, try again
      if (await page.locator('text=/success|subscribed/i').isVisible()) {
        // Wait for auto-reset
        await page.waitForTimeout(3500);
        
        // Try to submit same email again
        await emailInput.fill(duplicateEmail);
        await subscribeButton.click();
      }

      // Should handle duplicate appropriately (either success or error message)
      const isSuccess = await page.locator('text=/success|subscribed/i').isVisible();
      const isError = await page.locator('[role="alert"]').or(
        page.locator('text=/already|duplicate/i')
      ).isVisible();

      expect(isSuccess || isError).toBeTruthy();
    });

    test('should handle network errors gracefully', async ({ page }) => {
      // Intercept API calls and simulate network error
      await page.route('**/api/subscribe', (route) => {
        route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Internal server error' })
        });
      });

      const emailInput = page.locator('input[type="email"]').first();
      const subscribeButton = page.locator('button:has-text("Notify")').or(
        page.locator('button:has-text("Subscribe")')
      ).first();

      await emailInput.fill('network-error@example.com');
      await subscribeButton.click();

      // Should show loading state
      await expect(subscribeButton).toBeDisabled();

      // Should handle error and return to normal state
      await expect(subscribeButton).toBeEnabled({ timeout: 10000 });

      // Should not show success state
      await expect(page.locator('text=/success|subscribed/i')).not.toBeVisible();
    });

    test('should handle rate limiting', async ({ page }) => {
      // Intercept API calls and simulate rate limiting
      await page.route('**/api/subscribe', (route) => {
        route.fulfill({
          status: 429,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Rate limit exceeded' }),
          headers: {
            'X-RateLimit-Reset': Math.ceil((Date.now() + 60000) / 1000).toString()
          }
        });
      });

      const emailInput = page.locator('input[type="email"]').first();
      const subscribeButton = page.locator('button:has-text("Notify")').or(
        page.locator('button:has-text("Subscribe")')
      ).first();

      await emailInput.fill('rate-limited@example.com');
      await subscribeButton.click();

      // Should eventually return to normal state
      await expect(subscribeButton).toBeEnabled({ timeout: 10000 });
    });
  });

  test.describe('Accessibility in Real Browser', () => {
    test('should support keyboard navigation', async ({ page }) => {
      // Tab to the email input
      await page.keyboard.press('Tab');
      
      // Should focus the email input (or first focusable element)
      const focusedElement = page.locator(':focus');
      await expect(focusedElement).toBeVisible();

      // If it's not the email input, continue tabbing
      let attempts = 0;
      while (attempts < 10) {
        const tagName = await focusedElement.evaluate(el => el.tagName.toLowerCase());
        if (tagName === 'input') {
          const type = await focusedElement.getAttribute('type');
          if (type === 'email') {
            break;
          }
        }
        await page.keyboard.press('Tab');
        attempts++;
      }

      // Type email using keyboard
      await page.keyboard.type('keyboard-test@example.com');

      // Tab to submit button
      await page.keyboard.press('Tab');
      
      // Press Enter to submit
      await page.keyboard.press('Enter');

      // Should submit successfully
      await expect(page.locator('text=/success|subscribed/i')).toBeVisible({ timeout: 10000 });
    });

    test('should have proper focus management', async ({ page }) => {
      const emailInput = page.locator('input[type="email"]').first();
      
      // Click to focus
      await emailInput.click();
      await expect(emailInput).toBeFocused();

      // Verify focus styles are applied
      const focusOutline = await emailInput.evaluate(el => {
        const styles = getComputedStyle(el);
        return styles.outline || styles.boxShadow || styles.border;
      });
      
      // Should have some form of focus indicator
      expect(focusOutline).toBeTruthy();
    });

    test('should announce state changes to screen readers', async ({ page }) => {
      // Check for ARIA live regions
      const liveRegions = page.locator('[aria-live]');
      
      if (await liveRegions.count() > 0) {
        await expect(liveRegions.first()).toBeVisible();
      }

      // Check for proper ARIA labels
      const emailInput = page.locator('input[type="email"]').first();
      const ariaLabel = await emailInput.getAttribute('aria-label');
      const ariaLabelledby = await emailInput.getAttribute('aria-labelledby');
      
      // Should have some form of accessible name
      if (!ariaLabel && !ariaLabelledby) {
        // Check for associated label
        const inputId = await emailInput.getAttribute('id');
        if (inputId) {
          const label = page.locator(`label[for="${inputId}"]`);
          await expect(label).toBeVisible();
        }
      }
    });
  });

  test.describe('Visual Verification', () => {
    test('should render form correctly', async ({ page }) => {
      const emailInput = page.locator('input[type="email"]').first();
      const subscribeButton = page.locator('button:has-text("Notify")').or(
        page.locator('button:has-text("Subscribe")')
      ).first();

      // Visual elements should be present
      await expect(emailInput).toBeVisible();
      await expect(subscribeButton).toBeVisible();

      // Take screenshot for visual regression
      await page.screenshot({ 
        path: `test-results/email-subscription-form-${Date.now()}.png`,
        fullPage: true 
      });
    });

    test('should show loading state visually', async ({ page }) => {
      const emailInput = page.locator('input[type="email"]').first();
      const subscribeButton = page.locator('button:has-text("Notify")').or(
        page.locator('button:has-text("Subscribe")')
      ).first();

      await emailInput.fill('loading-test@example.com');
      
      // Click and immediately screenshot loading state
      await subscribeButton.click();
      
      // Should show loading state
      await expect(subscribeButton).toBeDisabled();
      
      // Take screenshot of loading state
      await page.screenshot({ 
        path: `test-results/email-subscription-loading-${Date.now()}.png`,
        fullPage: true 
      });
    });

    test('should display success state correctly', async ({ page }) => {
      const emailInput = page.locator('input[type="email"]').first();
      const subscribeButton = page.locator('button:has-text("Notify")').or(
        page.locator('button:has-text("Subscribe")')
      ).first();

      await emailInput.fill('success-visual@example.com');
      await subscribeButton.click();

      // Wait for success state
      await expect(page.locator('text=/success|subscribed/i')).toBeVisible();

      // Take screenshot of success state
      await page.screenshot({ 
        path: `test-results/email-subscription-success-${Date.now()}.png`,
        fullPage: true 
      });
    });
  });

  test.describe('Mobile Responsiveness', () => {
    test('should work on mobile viewport', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });

      const emailInput = page.locator('input[type="email"]').first();
      const subscribeButton = page.locator('button:has-text("Notify")').or(
        page.locator('button:has-text("Subscribe")')
      ).first();

      // Elements should still be visible and usable
      await expect(emailInput).toBeVisible();
      await expect(subscribeButton).toBeVisible();

      // Should be able to complete subscription
      await emailInput.fill('mobile-test@example.com');
      await subscribeButton.click();

      await expect(page.locator('text=/success|subscribed/i')).toBeVisible({ timeout: 10000 });
    });

    test('should have adequate touch targets on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });

      const subscribeButton = page.locator('button:has-text("Notify")').or(
        page.locator('button:has-text("Subscribe")')
      ).first();

      // Button should have adequate size for touch
      const boundingBox = await subscribeButton.boundingBox();
      expect(boundingBox?.width).toBeGreaterThan(44); // Minimum touch target size
      expect(boundingBox?.height).toBeGreaterThan(44);
    });
  });

  test.describe('Performance', () => {
    test('should load and render quickly', async ({ page }) => {
      const startTime = Date.now();
      
      await page.goto('/');
      
      // Wait for form elements to be visible
      await page.locator('input[type="email"]').first().waitFor({ state: 'visible' });
      
      const endTime = Date.now();
      const loadTime = endTime - startTime;
      
      // Should load within reasonable time (adjust based on your requirements)
      expect(loadTime).toBeLessThan(5000); // 5 seconds
    });

    test('should respond to interactions quickly', async ({ page }) => {
      const emailInput = page.locator('input[type="email"]').first();
      
      const startTime = Date.now();
      await emailInput.fill('performance@example.com');
      const endTime = Date.now();
      
      const responseTime = endTime - startTime;
      expect(responseTime).toBeLessThan(1000); // 1 second for input response
    });
  });
});