import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate the incoming data
    const requiredFields = ['name', 'value', 'rating', 'delta', 'id'];
    for (const field of requiredFields) {
      if (!(field in body)) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Log web vitals data (in production, you'd send this to your analytics service)
    console.log('Web Vitals Data:', {
      metric: body.name,
      value: body.value,
      rating: body.rating,
      url: body.url || 'unknown',
      timestamp: body.timestamp || Date.now(),
      userAgent: body.userAgent?.substring(0, 100) || 'unknown', // Truncate for privacy
    });

    // In a real application, you would:
    // 1. Send to your analytics service (e.g., Google Analytics, Mixpanel, etc.)
    // 2. Store in a database for analysis
    // 3. Send to monitoring services (e.g., Sentry, DataDog, etc.)
    
    // Example integrations:
    
    // Google Analytics 4 Server-Side API
    // await sendToGA4(body);
    
    // Custom database storage
    // await storeWebVital(body);
    
    // Monitoring service
    // await sendToMonitoring(body);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error processing web vitals:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Example helper functions for different integrations:

// async function sendToGA4(data: any) {
//   // Implement Google Analytics 4 Measurement Protocol
//   const GA_MEASUREMENT_ID = process.env.GA_MEASUREMENT_ID;
//   const GA_API_SECRET = process.env.GA_API_SECRET;
  
//   if (!GA_MEASUREMENT_ID || !GA_API_SECRET) {
//     return;
//   }

//   try {
//     await fetch(`https://www.google-analytics.com/mp/collect?measurement_id=${GA_MEASUREMENT_ID}&api_secret=${GA_API_SECRET}`, {
//       method: 'POST',
//       body: JSON.stringify({
//         client_id: data.id,
//         events: [{
//           name: 'web_vitals',
//           params: {
//             metric_name: data.name,
//             metric_value: Math.round(data.value),
//             metric_rating: data.rating,
//             page_location: data.url,
//           }
//         }]
//       })
//     });
//   } catch (error) {
//     console.error('Failed to send to GA4:', error);
//   }
// }

// async function storeWebVital(data: any) {
//   // Store in your database (e.g., Supabase, PostgreSQL, etc.)
//   // const { createClient } = require('@supabase/supabase-js');
//   // const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
  
//   // await supabase
//     // .from('web_vitals')
//     // .insert({
//     //   metric_name: data.name,
//     //   metric_value: data.value,
//     //   metric_rating: data.rating,
//     //   metric_delta: data.delta,
//     //   metric_id: data.id,
//     //   page_url: data.url,
//     //   user_agent: data.userAgent,
//     //   created_at: new Date(data.timestamp).toISOString(),
//     // });
// }

// async function sendToMonitoring(data: any) {
//   // Send to monitoring services like Sentry, DataDog, etc.
//   // This helps track performance regressions
//   if (data.rating === 'poor') {
//     // Alert on poor performance
//     console.warn(`Poor ${data.name} performance: ${data.value}ms on ${data.url}`);
//   }
// }