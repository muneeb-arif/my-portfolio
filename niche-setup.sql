-- Create niche table
CREATE TABLE IF NOT EXISTS niche (
    id SERIAL PRIMARY KEY,
    image VARCHAR NOT NULL DEFAULT 'default.jpeg',
    title VARCHAR NOT NULL,
    overview TEXT DEFAULT '',
    tools TEXT DEFAULT '',
    key_features TEXT,
    sort_order INTEGER DEFAULT 1,
    ai_driven BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for sorting
CREATE INDEX IF NOT EXISTS idx_niche_sort_order ON niche(sort_order);

-- Enable Row Level Security
ALTER TABLE niche ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access
CREATE POLICY "Allow public read access to niche" ON niche
    FOR SELECT USING (true);

-- Create policy for authenticated users to manage niche
CREATE POLICY "Allow authenticated users to manage niche" ON niche
    FOR ALL USING (auth.role() = 'authenticated');

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_niche_updated_at 
    BEFORE UPDATE ON niche 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column(); 