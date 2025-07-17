-- Add is_prompt column to projects table
ALTER TABLE projects ADD COLUMN is_prompt TINYINT DEFAULT 0;

-- Update existing projects to have is_prompt = 0 (they are regular projects)
UPDATE projects SET is_prompt = 0 WHERE is_prompt IS NULL; 