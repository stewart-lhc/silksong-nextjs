/**
 * End-to-End tests for Newsletter subscription flow
 */

import { test, expect } from '@playwright/test';

test.describe('Newsletter Subscription Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the homepage where newsletter form exists
    await page.goto('/');
  });

  test.describe('Newsletter Form', () => {
    test('should display newsletter form', async ({ page }) => {
      // Check if newsletter form is visible
      const form = page.locator('[data-testid="newsletter-form"]');
      await expect(form).toBeVisible();

      // Check form elements
      const emailInput = page.locator('input[type="email"]');
      const submitButton = page.locator('button[type="submit"]');
      
      await expect(emailInput).toBeVisible();
      await expect(submitButton).toBeVisible();
      await expect(submitButton).toContainText(/subscribe|join|sign up/i);
    });

    test('should show subscriber count if enabled', async ({ page }) => {
      const subscriberCount = page.locator('[data-testid="subscriber-count"]');
      
      // Check if subscriber count is displayed
      if (await subscriberCount.isVisible()) {
        await expect(subscriberCount).toContainText(/subscriber/i);
        await expect(subscriberCount).toContainText(/\d+/);
      }
    });

    test('should validate email input', async ({ page }) => {
      const emailInput = page.locator('input[type="email"]');
      const submitButton = page.locator('button[type="submit"]');

      // Test empty email
      await submitButton.click();
      await expect(page.locator('[role="alert"]')).toContainText(/required|enter.*email/i);

      // Test invalid email
      await emailInput.fill('invalid-email');
      await submitButton.click();
      await expect(page.locator('[role="alert"]')).toContainText(/valid.*email/i);

      // Clear error when valid email is entered
      await emailInput.fill('test@example.com');
      await expect(page.locator('[role="alert"]')).not.toBeVisible();
    });

    test('should successfully subscribe with valid email', async ({ page }) => {
      const emailInput = page.locator('input[type="email"]');
      const submitButton = page.locator('button[type="submit"]');

      // Fill in valid email
      const testEmail = `test-${Date.now()}@example.com`;
      await emailInput.fill(testEmail);

      // Submit form
      await submitButton.click();

      // Should show loading state
      await expect(submitButton).toBeDisabled();
      await expect(submitButton).toContainText(/subscribing|loading/i);

      // Wait for success message
      await expect(page.locator('[role="alert"]')).toContainText(/success|subscribed/i, { timeout: 10000 });
      
      // Form should be reset or show success state
      await expect(emailInput).toHaveValue('');
    });

    test('should handle already subscribed email', async ({ page }) => {
      const emailInput = page.locator('input[type="email"]');
      const submitButton = page.locator('button[type="submit"]');

      // Use a known subscribed email (this would need to be seeded in test data)
      await emailInput.fill('existing@example.com');
      await submitButton.click();

      // Should show already subscribed message
      await expect(page.locator('[role="alert"]')).toContainText(/already.*subscribed/i, { timeout: 10000 });
    });

    test('should show error for blocked domains', async ({ page }) => {
      const emailInput = page.locator('input[type="email"]');
      const submitButton = page.locator('button[type="submit"]');

      // Use a blocked domain
      await emailInput.fill('test@tempmail.org');
      await submitButton.click();

      // Should show domain not allowed error
      await expect(page.locator('[role="alert"]')).toContainText(/domain.*not.*allowed/i);
    });
  });

  test.describe('Newsletter Modal', () => {
    test('should open modal when trigger is clicked', async ({ page }) => {
      // Look for modal trigger button (might be in navigation or footer)
      const modalTrigger = page.locator('[data-testid="newsletter-modal-trigger"]');
      
      if (await modalTrigger.isVisible()) {
        await modalTrigger.click();

        // Modal should be visible
        const modal = page.locator('[role="dialog"]');
        await expect(modal).toBeVisible();
        
        // Modal should have proper accessibility attributes
        await expect(modal).toHaveAttribute('aria-modal', 'true');
        await expect(modal).toHaveAttribute('aria-labelledby');
      }
    });

    test('should close modal with close button', async ({ page }) => {
      const modalTrigger = page.locator('[data-testid="newsletter-modal-trigger"]');
      
      if (await modalTrigger.isVisible()) {
        await modalTrigger.click();
        
        const modal = page.locator('[role="dialog"]');
        await expect(modal).toBeVisible();

        // Click close button
        const closeButton = modal.locator('[aria-label="Close modal"]');
        await closeButton.click();

        // Modal should be closed
        await expect(modal).not.toBeVisible();
      }
    });

    test('should close modal with escape key', async ({ page }) => {
      const modalTrigger = page.locator('[data-testid="newsletter-modal-trigger"]');
      
      if (await modalTrigger.isVisible()) {
        await modalTrigger.click();
        
        const modal = page.locator('[role="dialog"]');
        await expect(modal).toBeVisible();

        // Press escape key
        await page.keyboard.press('Escape');

        // Modal should be closed
        await expect(modal).not.toBeVisible();
      }
    });

    test('should close modal on backdrop click', async ({ page }) => {
      const modalTrigger = page.locator('[data-testid="newsletter-modal-trigger"]');
      
      if (await modalTrigger.isVisible()) {
        await modalTrigger.click();
        
        const modal = page.locator('[role="dialog"]');
        await expect(modal).toBeVisible();

        // Click on backdrop (outside modal content)
        const backdrop = page.locator('.newsletter-modal__backdrop');
        await backdrop.click();

        // Modal should be closed
        await expect(modal).not.toBeVisible();
      }
    });

    test('should auto-close modal on successful subscription', async ({ page }) => {
      const modalTrigger = page.locator('[data-testid="newsletter-modal-trigger"]');
      
      if (await modalTrigger.isVisible()) {
        await modalTrigger.click();
        
        const modal = page.locator('[role="dialog"]');
        await expect(modal).toBeVisible();

        // Fill and submit form in modal
        const emailInput = modal.locator('input[type="email"]');
        const submitButton = modal.locator('button[type="submit"]');
        
        const testEmail = `modal-test-${Date.now()}@example.com`;
        await emailInput.fill(testEmail);
        await submitButton.click();

        // Wait for success and modal auto-close
        await expect(modal).not.toBeVisible({ timeout: 15000 });
      }
    });
  });

  test.describe('Newsletter Toast Notifications', () => {
    test('should show success toast after subscription', async ({ page }) => {
      const emailInput = page.locator('input[type="email"]');
      const submitButton = page.locator('button[type="submit"]');

      // Subscribe with valid email
      const testEmail = `toast-test-${Date.now()}@example.com`;
      await emailInput.fill(testEmail);
      await submitButton.click();

      // Check for toast notification
      const toast = page.locator('.newsletter-toast');
      await expect(toast).toBeVisible({ timeout: 10000 });
      await expect(toast).toContainText(/success|subscribed/i);
      
      // Toast should have success styling
      await expect(toast).toHaveClass(/success|green/);
    });

    test('should show error toast on subscription failure', async ({ page }) => {
      const emailInput = page.locator('input[type="email"]');
      const submitButton = page.locator('button[type="submit"]');

      // Use blocked domain to trigger error
      await emailInput.fill('test@tempmail.org');
      await submitButton.click();

      // Check for error toast
      const toast = page.locator('.newsletter-toast');
      await expect(toast).toBeVisible({ timeout: 10000 });
      await expect(toast).toContainText(/error|failed|not.*allowed/i);
      
      // Toast should have error styling
      await expect(toast).toHaveClass(/error|red/);
    });

    test('should auto-dismiss toast after timeout', async ({ page }) => {
      const emailInput = page.locator('input[type="email"]');
      const submitButton = page.locator('button[type="submit"]');

      // Trigger a toast
      const testEmail = `auto-dismiss-${Date.now()}@example.com`;
      await emailInput.fill(testEmail);
      await submitButton.click();

      const toast = page.locator('.newsletter-toast');
      await expect(toast).toBeVisible({ timeout: 10000 });
      
      // Toast should auto-dismiss (default 5 seconds + some buffer)
      await expect(toast).not.toBeVisible({ timeout: 8000 });
    });

    test('should dismiss toast when close button is clicked', async ({ page }) => {
      const emailInput = page.locator('input[type="email"]');
      const submitButton = page.locator('button[type="submit"]');

      // Trigger a toast
      const testEmail = `dismiss-test-${Date.now()}@example.com`;
      await emailInput.fill(testEmail);
      await submitButton.click();

      const toast = page.locator('.newsletter-toast');
      await expect(toast).toBeVisible({ timeout: 10000 });
      
      // Click close button
      const closeButton = toast.locator('.newsletter-toast__close');
      if (await closeButton.isVisible()) {
        await closeButton.click();
        await expect(toast).not.toBeVisible();
      }
    });
  });

  test.describe('Accessibility', () => {
    test('should have proper focus management', async ({ page }) => {
      const emailInput = page.locator('input[type="email"]');
      
      // Tab to email input
      await page.keyboard.press('Tab');
      await expect(emailInput).toBeFocused();
      
      // Tab to submit button
      await page.keyboard.press('Tab');
      const submitButton = page.locator('button[type="submit"]');
      await expect(submitButton).toBeFocused();
    });

    test('should announce status changes to screen readers', async ({ page }) => {
      const emailInput = page.locator('input[type="email"]');
      const submitButton = page.locator('button[type="submit"]');

      // Fill invalid email
      await emailInput.fill('invalid-email');
      await submitButton.click();

      // Check for aria-live regions or role="alert"
      const alert = page.locator('[role="alert"], [aria-live="polite"], [aria-live="assertive"]');
      await expect(alert).toBeVisible();
      await expect(alert).toContainText(/valid.*email/i);
    });

    test('should have proper ARIA attributes', async ({ page }) => {
      const form = page.locator('[data-testid="newsletter-form"]');
      const emailInput = page.locator('input[type="email"]');
      const submitButton = page.locator('button[type="submit"]');

      // Form should have proper label
      await expect(form).toHaveAttribute('aria-label');
      
      // Email input should have proper attributes
      await expect(emailInput).toHaveAttribute('aria-required', 'true');
      await expect(emailInput).toHaveAttribute('type', 'email');
      
      // Submit button should have proper type
      await expect(submitButton).toHaveAttribute('type', 'submit');
    });

    test('should support keyboard navigation in modal', async ({ page }) => {
      const modalTrigger = page.locator('[data-testid="newsletter-modal-trigger"]');
      
      if (await modalTrigger.isVisible()) {
        // Open modal
        await modalTrigger.click();
        const modal = page.locator('[role="dialog"]');
        await expect(modal).toBeVisible();

        // Focus should be trapped in modal
        await page.keyboard.press('Tab');
        const emailInput = modal.locator('input[type="email"]');
        await expect(emailInput).toBeFocused();

        // Continue tabbing through modal elements
        await page.keyboard.press('Tab');
        const submitButton = modal.locator('button[type="submit"]');
        await expect(submitButton).toBeFocused();

        // Tab should cycle back to close button or first element
        await page.keyboard.press('Tab');
        const closeButton = modal.locator('[aria-label="Close modal"]');
        if (await closeButton.isVisible()) {
          await expect(closeButton).toBeFocused();
        }
      }
    });
  });

  test.describe('Performance', () => {
    test('should load newsletter form quickly', async ({ page }) => {
      const startTime = Date.now();
      await page.goto('/');
      
      // Form should be visible within reasonable time
      const form = page.locator('[data-testid="newsletter-form"]');
      await expect(form).toBeVisible({ timeout: 5000 });
      
      const loadTime = Date.now() - startTime;
      expect(loadTime).toBeLessThan(5000); // 5 seconds max
    });

    test('should handle rapid form submissions gracefully', async ({ page }) => {
      const emailInput = page.locator('input[type="email"]');
      const submitButton = page.locator('button[type="submit"]');

      // Fill email
      await emailInput.fill('rapid-test@example.com');

      // Click submit multiple times rapidly
      await submitButton.click();
      await submitButton.click();
      await submitButton.click();

      // Should show loading state and prevent multiple submissions
      await expect(submitButton).toBeDisabled();
      
      // Should eventually show result (success or error)
      await expect(page.locator('[role="alert"]')).toBeVisible({ timeout: 15000 });
    });
  });

  test.describe('Mobile Responsiveness', () => {
    test('should work on mobile viewport', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/');

      const form = page.locator('[data-testid="newsletter-form"]');
      const emailInput = page.locator('input[type="email"]');
      const submitButton = page.locator('button[type="submit"]');

      // Elements should be visible and properly sized
      await expect(form).toBeVisible();
      await expect(emailInput).toBeVisible();
      await expect(submitButton).toBeVisible();

      // Should be able to interact with form
      await emailInput.fill('mobile-test@example.com');
      await submitButton.click();

      // Should show loading state
      await expect(submitButton).toBeDisabled();
    });

    test('should handle touch interactions', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/');

      const emailInput = page.locator('input[type="email"]');
      
      // Tap on input should focus it
      await emailInput.tap();
      await expect(emailInput).toBeFocused();

      // Should be able to type on mobile keyboard
      await emailInput.fill('touch-test@example.com');
      await expect(emailInput).toHaveValue('touch-test@example.com');
    });
  });

  test.describe('Cross-browser Compatibility', () => {
    ['chromium', 'firefox', 'webkit'].forEach(browserName => {
      test(`should work in ${browserName}`, async ({ page, browserName: currentBrowser }) => {
        // Skip if not the target browser
        test.skip(currentBrowser !== browserName);

        await page.goto('/');
        
        const emailInput = page.locator('input[type="email"]');
        const submitButton = page.locator('button[type="submit"]');

        // Basic functionality should work
        await emailInput.fill('browser-test@example.com');
        await submitButton.click();
        
        await expect(submitButton).toBeDisabled();
        await expect(page.locator('[role="alert"]')).toBeVisible({ timeout: 15000 });
      });
    });
  });
});