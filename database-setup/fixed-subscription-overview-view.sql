-- Fixed PostgreSQL view for subscription overview analytics
-- Addresses: ungrouped column errors, proper tag aggregation, and PostgreSQL/Supabase compatibility

CREATE OR REPLACE VIEW v_subscription_overview AS
WITH daily_stats AS (
    -- Main aggregation by date, source, and status
    SELECT 
        DATE_TRUNC('day', subscribed_at) as date,
        source,
        status,
        COUNT(*) as count,
        COUNT(*) FILTER (WHERE confirmed_at IS NOT NULL) as confirmed_count
    FROM email_subscriptions
    GROUP BY DATE_TRUNC('day', subscribed_at), source, status
),
tag_popularity AS (
    -- Calculate tag popularity for each date/source/status combination
    SELECT 
        DATE_TRUNC('day', subscribed_at) as date,
        source,
        status,
        tag,
        COUNT(*) as tag_count
    FROM email_subscriptions,
         LATERAL unnest(
             CASE 
                 WHEN tags IS NULL OR tags = '{}' THEN ARRAY[]::TEXT[]
                 ELSE tags 
             END
         ) AS tag
    GROUP BY DATE_TRUNC('day', subscribed_at), source, status, tag
),
top_tags AS (
    -- Get top 10 tags for each date/source/status combination
    SELECT 
        date,
        source,
        status,
        ARRAY_AGG(tag ORDER BY tag_count DESC) as popular_tags
    FROM (
        SELECT 
            date,
            source,
            status,
            tag,
            tag_count,
            ROW_NUMBER() OVER (
                PARTITION BY date, source, status 
                ORDER BY tag_count DESC, tag
            ) as rn
        FROM tag_popularity
    ) ranked_tags
    WHERE rn <= 10
    GROUP BY date, source, status
)
-- Final result combining daily stats with popular tags
SELECT 
    ds.date,
    ds.source,
    ds.status,
    ds.count,
    ds.confirmed_count,
    COALESCE(tt.popular_tags, ARRAY[]::TEXT[]) as popular_tags
FROM daily_stats ds
LEFT JOIN top_tags tt ON (
    ds.date = tt.date 
    AND ds.source = tt.source 
    AND ds.status = tt.status
)
ORDER BY ds.date DESC, ds.source, ds.status;

-- Create an index on the underlying table to optimize this view's performance
-- (Only run this if the index doesn't already exist)
CREATE INDEX IF NOT EXISTS idx_email_subscriptions_analytics 
ON email_subscriptions (
    DATE_TRUNC('day', subscribed_at), 
    source, 
    status, 
    confirmed_at
);

-- Optional: Create a partial index for faster tag operations
CREATE INDEX IF NOT EXISTS idx_email_subscriptions_tags_gin 
ON email_subscriptions USING GIN (tags) 
WHERE tags IS NOT NULL AND tags != '{}';

-- Test query to verify the view works correctly
-- SELECT * FROM v_subscription_overview LIMIT 5;

-- Performance analysis query (uncomment to run)
-- EXPLAIN (ANALYZE, BUFFERS) 
-- SELECT * FROM v_subscription_overview 
-- WHERE date >= CURRENT_DATE - INTERVAL '30 days';