-- Add order_index column to project_images table for image ordering
-- This allows users to maintain their selected image sequence

-- Add the order_index column to project_images table
ALTER TABLE project_images 
ADD COLUMN order_index INTEGER DEFAULT 0;

-- Create an index for better performance when ordering
CREATE INDEX IF NOT EXISTS idx_project_images_order 
ON project_images(project_id, order_index);

-- Update existing records to have a sequential order_index
-- This ensures existing projects don't break
UPDATE project_images 
SET order_index = subquery.row_number - 1
FROM (
  SELECT 
    id,
    ROW_NUMBER() OVER (PARTITION BY project_id ORDER BY created_at) as row_number
  FROM project_images
) as subquery
WHERE project_images.id = subquery.id;

-- Add a comment to document the column purpose
COMMENT ON COLUMN project_images.order_index IS 'Stores the display order of images within a project (0-based index)';

-- Verify the changes
SELECT 
  project_id,
  name,
  order_index,
  created_at
FROM project_images 
ORDER BY project_id, order_index 
LIMIT 10; 