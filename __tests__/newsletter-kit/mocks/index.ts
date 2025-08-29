/**
 * Mock utilities for Newsletter Kit testing
 */

import type { 
  DatabaseAdapter, 
  BaseSubscription, 
  SubscriberCount,
  NewsletterConfig,
  SubscriptionResult,
  PaginatedSubscriptions,
  DatabaseHealthStatus,
} from '@/lib/newsletter-kit/types';

// ========================= MOCK DATABASE ADAPTER =========================
export const createMockDatabaseAdapter = (): jest.Mocked<DatabaseAdapter> => ({
  insert: jest.fn(),
  findByEmail: jest.fn(),
  findById: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  count: jest.fn(),
  list: jest.fn(),
  healthCheck: jest.fn(),
});

// ========================= MOCK DATA GENERATORS =========================
export const createMockSubscription = (overrides: Partial<BaseSubscription> = {}): BaseSubscription => ({
  id: 'sub-123' as any,
  email: 'test@example.com' as any,
  subscribed_at: '2024-01-01T00:00:00.000Z' as any,
  status: 'active',
  source: 'web',
  ...overrides,
});

export const createMockSubscriberCount = (count: number = 1234): SubscriberCount => {
  return count as SubscriberCount;
};

export const createMockPaginatedSubscriptions = (
  items: BaseSubscription[] = [],
  total: number = items.length
): PaginatedSubscriptions => ({
  items,
  total,
  limit: 10,
  offset: 0,
  hasNext: total > items.length,
  hasPrevious: false,
});

export const createMockHealthStatus = (healthy: boolean = true): DatabaseHealthStatus => ({
  healthy,
  latency: 50,
  connections: {
    active: 5,
    idle: 10,
    total: 15,
  },
  lastCheck: new Date().toISOString() as any,
});

// ========================= MOCK CONFIGURATION =========================
export const createMockConfig = (overrides: Partial<NewsletterConfig> = {}): NewsletterConfig => ({
  database: {
    adapter: createMockDatabaseAdapter(),
    tableName: 'test_subscriptions',
  },
  api: {
    baseUrl: 'http://localhost:3000',
    endpoints: {
      subscribe: '/api/newsletter/subscribe',
      unsubscribe: '/api/newsletter/unsubscribe',
      stats: '/api/newsletter/stats',
    },
    timeout: 10000,
    retries: 3,
  },
  validation: {
    emailRegex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    allowedDomains: [],
    blockedDomains: ['tempmail.org', 'mailinator.com'],
    maxLength: 254,
  },
  rateLimit: {
    enabled: true,
    maxRequests: 5,
    windowMs: 900000, // 15 minutes
    skipSuccessfulRequests: true,
  },
  ui: {
    theme: 'auto',
    variant: 'default',
    size: 'md',
    showCount: true,
  },
  messages: {
    placeholder: 'Enter your email address',
    submitText: 'Subscribe',
    loadingText: 'Subscribing...',
    successText: 'Successfully subscribed!',
    alreadySubscribed: "You're already subscribed!",
    invalidEmail: 'Please enter a valid email address',
    networkError: 'Network error. Please try again.',
    serverError: 'Server error. Please try again later.',
    rateLimitExceeded: 'Too many requests. Please wait and try again.',
  },
  analytics: {
    trackSubscriptions: true,
    trackErrors: true,
    customEvents: {},
  },
  ...overrides,
});

// ========================= FETCH MOCKS =========================
export const createSuccessfulSubscriptionResponse = (
  subscription: BaseSubscription = createMockSubscription(),
  count: SubscriberCount = createMockSubscriberCount(),
  isNewSubscription: boolean = true
) => ({
  ok: true,
  status: isNewSubscription ? 201 : 200,
  json: async () => ({
    success: true,
    data: {
      subscription,
      count,
      isNewSubscription,
    },
    timestamp: new Date().toISOString(),
  }),
});

export const createErrorResponse = (
  status: number,
  error: string,
  code?: string
) => ({
  ok: false,
  status,
  json: async () => ({
    success: false,
    error,
    code,
    timestamp: new Date().toISOString(),
  }),
});

export const createNetworkError = () => {
  throw new Error('Network error');
};

// ========================= SUPABASE MOCKS =========================
export const createMockSupabaseClient = () => {
  const mockChain = {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    neq: jest.fn().mockReturnThis(),
    gt: jest.fn().mockReturnThis(),
    gte: jest.fn().mockReturnThis(),
    lt: jest.fn().mockReturnThis(),
    lte: jest.fn().mockReturnThis(),
    like: jest.fn().mockReturnThis(),
    ilike: jest.fn().mockReturnThis(),
    in: jest.fn().mockReturnThis(),
    is: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    range: jest.fn().mockReturnThis(),
    single: jest.fn(),
    maybeSingle: jest.fn(),
  };

  return mockChain;
};

// ========================= DOM MOCKS =========================
export const mockIntersectionObserver = () => {
  const mockIntersectionObserver = jest.fn();
  mockIntersectionObserver.mockReturnValue({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
  });
  (window as any).IntersectionObserver = mockIntersectionObserver;
};

export const mockResizeObserver = () => {
  const mockResizeObserver = jest.fn();
  mockResizeObserver.mockReturnValue({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
  });
  (window as any).ResizeObserver = mockResizeObserver;
};

export const mockMatchMedia = () => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(), // deprecated
      removeListener: jest.fn(), // deprecated
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });
};

// ========================= LOCAL STORAGE MOCKS =========================
export const mockLocalStorage = () => {
  const localStorageMock = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
  };
  Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
  });
  return localStorageMock;
};

// ========================= ANALYTICS MOCKS =========================
export const mockGoogleAnalytics = () => {
  (window as any).gtag = jest.fn();
  (window as any).dataLayer = [];
};

export const mockCustomAnalytics = () => {
  const events: Array<{ name: string; data: any }> = [];
  
  window.addEventListener = jest.fn((event, handler) => {
    if (event === 'newsletter:analytics') {
      // Store for testing
      events.push({ name: event, data: handler });
    }
  });
  
  return { events };
};

// ========================= FORM VALIDATION MOCKS =========================
export const mockEmailValidation = () => {
  const validEmails = ['test@example.com', 'user@gmail.com', 'hello@company.co'];
  const invalidEmails = ['invalid', '@domain.com', 'user@', 'test@tempmail.org'];
  
  return {
    validEmails,
    invalidEmails,
    isValid: (email: string) => validEmails.includes(email),
    isInvalid: (email: string) => invalidEmails.includes(email),
  };
};

// ========================= RATE LIMITING MOCKS =========================
export const createMockRateLimit = () => {
  const requests = new Map<string, number[]>();
  
  return {
    checkRateLimit: (ip: string, maxRequests: number = 5, windowMs: number = 900000) => {
      const now = Date.now();
      const userRequests = requests.get(ip) || [];
      
      // Remove old requests
      const recentRequests = userRequests.filter(time => now - time < windowMs);
      
      if (recentRequests.length >= maxRequests) {
        return { allowed: false, retryAfter: Math.ceil(windowMs / 1000) };
      }
      
      recentRequests.push(now);
      requests.set(ip, recentRequests);
      
      return { 
        allowed: true, 
        remaining: maxRequests - recentRequests.length 
      };
    },
    reset: () => requests.clear(),
  };
};

// ========================= SUBSCRIPTION RESULT MOCKS =========================
export const createMockSubscriptionResult = (
  success: boolean = true,
  overrides: Partial<SubscriptionResult> = {}
): SubscriptionResult => {
  if (success) {
    return {
      success: true,
      subscription: createMockSubscription(),
      count: createMockSubscriberCount(),
      code: 'SUCCESS',
      ...overrides,
    };
  } else {
    return {
      success: false,
      error: {
        code: 'validation_email',
        message: 'Invalid email address',
      },
      code: 'INVALID_EMAIL',
      ...overrides,
    };
  }
};

// ========================= CLEANUP UTILITIES =========================
export const cleanupMocks = () => {
  jest.clearAllMocks();
  
  // Reset fetch
  if (global.fetch) {
    (global.fetch as jest.Mock).mockReset();
  }
  
  // Clear localStorage mock
  if (window.localStorage) {
    (window.localStorage.clear as jest.Mock)?.mockClear?.();
  }
};

// ========================= TEST UTILITIES =========================
export const waitForNextTick = () => new Promise(resolve => setTimeout(resolve, 0));

export const waitFor = (condition: () => boolean, timeout: number = 5000) => {
  return new Promise<void>((resolve, reject) => {
    const startTime = Date.now();
    
    const check = () => {
      if (condition()) {
        resolve();
      } else if (Date.now() - startTime > timeout) {
        reject(new Error(`Condition not met within ${timeout}ms`));
      } else {
        setTimeout(check, 10);
      }
    };
    
    check();
  });
};

// ========================= SNAPSHOT HELPERS =========================
export const createNewsletterFormSnapshot = (props: any = {}) => ({
  variant: 'default',
  size: 'md',
  theme: 'auto',
  showCount: true,
  showSuccess: true,
  autoFocus: false,
  disabled: false,
  placeholder: 'Enter your email address',
  submitText: 'Subscribe',
  loadingText: 'Subscribing...',
  successText: 'Successfully subscribed!',
  ...props,
});

// ========================= ACCESSIBILITY HELPERS =========================
export const mockAccessibilityFeatures = () => {
  // Mock screen reader announcements
  const announcements: string[] = [];
  
  const originalCreateElement = document.createElement;
  document.createElement = jest.fn((tagName: string) => {
    const element = originalCreateElement.call(document, tagName);
    
    if (tagName === 'div' && element.classList.contains('sr-only')) {
      // Capture screen reader announcements
      Object.defineProperty(element, 'textContent', {
        set: (value: string) => {
          announcements.push(value);
        },
        get: () => announcements[announcements.length - 1] || '',
      });
    }
    
    return element;
  });
  
  return {
    announcements,
    getLastAnnouncement: () => announcements[announcements.length - 1],
    clearAnnouncements: () => announcements.length = 0,
  };
};

// ========================= PERFORMANCE MOCKS =========================
export const mockPerformanceAPI = () => {
  const marks: Record<string, number> = {};
  const measures: Array<{ name: string; startTime: number; duration: number }> = [];
  
  (window as any).performance = {
    mark: jest.fn((name: string) => {
      marks[name] = Date.now();
    }),
    measure: jest.fn((name: string, startMark?: string, endMark?: string) => {
      const startTime = startMark ? marks[startMark] : Date.now();
      const endTime = endMark ? marks[endMark] : Date.now();
      const duration = endTime - startTime;
      
      measures.push({ name, startTime, duration });
      return { name, startTime, duration };
    }),
    now: jest.fn(() => Date.now()),
    getEntriesByName: jest.fn((name: string) => 
      measures.filter(m => m.name === name)
    ),
  };
  
  return { marks, measures };
};