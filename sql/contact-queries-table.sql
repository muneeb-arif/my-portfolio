-- Create contact_queries table to store form submissions
CREATE TABLE contact_queries (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    form_type VARCHAR(50) NOT NULL CHECK (form_type IN ('contact', 'onboarding')),
    
    -- Common fields
    name VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(50),
    company VARCHAR(255),
    subject VARCHAR(500),
    message TEXT,
    budget VARCHAR(100),
    timeline VARCHAR(100),
    
    -- Contact form specific
    inquiry_type VARCHAR(100),
    
    -- Onboarding form specific
    company_name VARCHAR(255),
    contact_person VARCHAR(255),
    communication_channel VARCHAR(100),
    business_description TEXT,
    target_customer TEXT,
    unique_value TEXT,
    problem_solving TEXT,
    core_features TEXT,
    existing_system TEXT,
    technical_constraints TEXT,
    competitors TEXT,
    brand_guide TEXT,
    color_preferences TEXT,
    tone_of_voice VARCHAR(100),
    payment_gateways TEXT,
    integrations TEXT,
    admin_control TEXT,
    gdpr_compliance BOOLEAN DEFAULT FALSE,
    terms_privacy BOOLEAN DEFAULT FALSE,
    launch_date DATE,
    budget_range VARCHAR(100),
    post_mvp_features TEXT,
    long_term_goals TEXT,
    
    -- Metadata
    status VARCHAR(50) DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'completed', 'archived')),
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    responded_at TIMESTAMPTZ
);

-- Create index for faster queries
CREATE INDEX idx_contact_queries_user_id ON contact_queries(user_id);
CREATE INDEX idx_contact_queries_form_type ON contact_queries(form_type);
CREATE INDEX idx_contact_queries_status ON contact_queries(status);
CREATE INDEX idx_contact_queries_created_at ON contact_queries(created_at DESC);

-- Enable RLS (Row Level Security)
ALTER TABLE contact_queries ENABLE ROW LEVEL SECURITY;

-- Create policy for users to only see their own queries
CREATE POLICY "Users can view their own queries" ON contact_queries
    FOR SELECT USING (auth.uid() = user_id);

-- Create policy for users to insert their own queries
CREATE POLICY "Users can insert their own queries" ON contact_queries
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create policy for users to update their own queries
CREATE POLICY "Users can update their own queries" ON contact_queries
    FOR UPDATE USING (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_contact_queries_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER contact_queries_updated_at
    BEFORE UPDATE ON contact_queries
    FOR EACH ROW
    EXECUTE FUNCTION update_contact_queries_updated_at();

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE ON contact_queries TO authenticated;
GRANT USAGE ON SEQUENCE contact_queries_id_seq TO authenticated; 