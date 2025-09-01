/**
 * Supabase Mocks for Testing
 * Mock implementations of Supabase client and related services
 */

export const mockSupabaseClient = {
  from: jest.fn().mockReturnValue({
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
    is: jest.fn().mockReturnThis(),
    in: jest.fn().mockReturnThis(),
    contains: jest.fn().mockReturnThis(),
    containedBy: jest.fn().mockReturnThis(),
    rangeGt: jest.fn().mockReturnThis(),
    rangeGte: jest.fn().mockReturnThis(),
    rangeLt: jest.fn().mockReturnThis(),
    rangeLte: jest.fn().mockReturnThis(),
    rangeAdjacent: jest.fn().mockReturnThis(),
    overlaps: jest.fn().mockReturnThis(),
    textSearch: jest.fn().mockReturnThis(),
    match: jest.fn().mockReturnThis(),
    not: jest.fn().mockReturnThis(),
    or: jest.fn().mockReturnThis(),
    filter: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    range: jest.fn().mockReturnThis(),
    abortSignal: jest.fn().mockReturnThis(),
    single: jest.fn().mockResolvedValue({ data: null, error: null }),
    maybeSingle: jest.fn().mockResolvedValue({ data: null, error: null }),
    csv: jest.fn().mockResolvedValue({ data: null, error: null }),
    then: jest.fn().mockResolvedValue({ data: [], error: null }),
  }),
  
  auth: {
    getUser: jest.fn().mockResolvedValue({ 
      data: { user: null }, 
      error: null 
    }),
    getSession: jest.fn().mockResolvedValue({ 
      data: { session: null }, 
      error: null 
    }),
    signUp: jest.fn().mockResolvedValue({ 
      data: { user: null, session: null }, 
      error: null 
    }),
    signInWithPassword: jest.fn().mockResolvedValue({ 
      data: { user: null, session: null }, 
      error: null 
    }),
    signInWithOAuth: jest.fn().mockResolvedValue({ 
      data: { provider: null, url: null }, 
      error: null 
    }),
    signOut: jest.fn().mockResolvedValue({ error: null }),
    resetPasswordForEmail: jest.fn().mockResolvedValue({ 
      data: {}, 
      error: null 
    }),
    updateUser: jest.fn().mockResolvedValue({ 
      data: { user: null }, 
      error: null 
    }),
    onAuthStateChange: jest.fn().mockReturnValue({
      data: { subscription: { unsubscribe: jest.fn() } },
    }),
  },
  
  storage: {
    from: jest.fn().mockReturnValue({
      upload: jest.fn().mockResolvedValue({ 
        data: null, 
        error: null 
      }),
      download: jest.fn().mockResolvedValue({ 
        data: null, 
        error: null 
      }),
      remove: jest.fn().mockResolvedValue({ 
        data: null, 
        error: null 
      }),
      list: jest.fn().mockResolvedValue({ 
        data: [], 
        error: null 
      }),
      update: jest.fn().mockResolvedValue({ 
        data: null, 
        error: null 
      }),
      move: jest.fn().mockResolvedValue({ 
        data: null, 
        error: null 
      }),
      copy: jest.fn().mockResolvedValue({ 
        data: null, 
        error: null 
      }),
      createSignedUrl: jest.fn().mockResolvedValue({ 
        data: null, 
        error: null 
      }),
      createSignedUrls: jest.fn().mockResolvedValue({ 
        data: null, 
        error: null 
      }),
      getPublicUrl: jest.fn().mockReturnValue({ 
        data: { publicUrl: '' } 
      }),
    }),
  },

  rpc: jest.fn().mockResolvedValue({ 
    data: null, 
    error: null 
  }),

  functions: {
    invoke: jest.fn().mockResolvedValue({ 
      data: null, 
      error: null 
    }),
  },

  realtime: {
    channel: jest.fn().mockReturnValue({
      on: jest.fn().mockReturnThis(),
      subscribe: jest.fn().mockReturnValue({
        unsubscribe: jest.fn(),
      }),
    }),
    removeChannel: jest.fn(),
    removeAllChannels: jest.fn(),
    getChannels: jest.fn().mockReturnValue([]),
  },
}

// Mock the Supabase client creation
jest.mock('@/lib/supabase/client', () => ({
  supabase: mockSupabaseClient,
}))

// Export mock responses for different scenarios
export const mockResponses = {
  newsletter: {
    subscribe: {
      success: { data: { id: '123', email: 'test@example.com' }, error: null },
      duplicate: { data: null, error: { message: 'Email already subscribed' } },
      invalid: { data: null, error: { message: 'Invalid email format' } },
    },
    unsubscribe: {
      success: { data: { id: '123' }, error: null },
      notFound: { data: null, error: { message: 'Subscription not found' } },
    },
    status: {
      active: { data: { status: 'active' }, error: null },
      pending: { data: { status: 'pending_confirmation' }, error: null },
      unsubscribed: { data: { status: 'unsubscribed' }, error: null },
    },
  },
}