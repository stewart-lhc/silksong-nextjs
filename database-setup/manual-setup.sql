
-- Create email status enum
CREATE TYPE IF NOT EXISTS email_send_status AS ENUM (
    'pending', 'sending', 'sent', 'failed', 'cancelled'
);

-- Create rollback task enums  
CREATE TYPE IF NOT EXISTS rollback_task_type AS ENUM (
    'cancel_subscription', 'mark_email_failed', 'retry_email_send', 'update_email_status'
);

CREATE TYPE IF NOT EXISTS rollback_task_status AS ENUM (
    'pending', 'processing', 'completed', 'failed'
);

-- Create email send attempts table
CREATE TABLE IF NOT EXISTS email_send_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(254) NOT NULL,
    subscription_id UUID,
    template_id VARCHAR(100) NOT NULL,
    status email_send_status DEFAULT 'pending',
    attempt_number INTEGER DEFAULT 1,
    sent_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT,
    retry_after TIMESTAMP WITH TIME ZONE,
    provider_response JSONB DEFAULT '{}',
    email_content JSONB DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT fk_email_send_attempts_subscription 
        FOREIGN KEY (subscription_id) 
        REFERENCES email_subscriptions(id) 
        ON DELETE SET NULL
);

-- Create email rollback tasks table
CREATE TABLE IF NOT EXISTS email_rollback_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_type rollback_task_type NOT NULL,
    email VARCHAR(254) NOT NULL,
    subscription_id UUID,
    send_attempt_id UUID,
    reason TEXT,
    task_data JSONB DEFAULT '{}',
    status rollback_task_status DEFAULT 'pending',
    processed_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT fk_rollback_tasks_subscription 
        FOREIGN KEY (subscription_id) 
        REFERENCES email_subscriptions(id) 
        ON DELETE SET NULL,
    CONSTRAINT fk_rollback_tasks_send_attempt 
        FOREIGN KEY (send_attempt_id) 
        REFERENCES email_send_attempts(id) 
        ON DELETE CASCADE
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_email_send_attempts_email ON email_send_attempts(email);
CREATE INDEX IF NOT EXISTS idx_email_send_attempts_status ON email_send_attempts(status);
CREATE INDEX IF NOT EXISTS idx_email_send_attempts_subscription_id ON email_send_attempts(subscription_id);

CREATE INDEX IF NOT EXISTS idx_email_rollback_tasks_status ON email_rollback_tasks(status);
CREATE INDEX IF NOT EXISTS idx_email_rollback_tasks_email ON email_rollback_tasks(email);

-- Enable RLS
ALTER TABLE email_send_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_rollback_tasks ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY IF NOT EXISTS "Service role full access send_attempts" ON email_send_attempts
    FOR ALL TO service_role USING (true) WITH CHECK (true);
    
CREATE POLICY IF NOT EXISTS "Service role full access rollback_tasks" ON email_rollback_tasks
    FOR ALL TO service_role USING (true) WITH CHECK (true);
