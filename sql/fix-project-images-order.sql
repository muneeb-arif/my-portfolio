-- Fix order_index values for existing project images
-- This script updates all existing project images to have sequential order_index values

-- First, let's see what we have currently
SELECT 
  project_id,
  name,
  order_index,
  created_at
FROM project_images 
ORDER BY project_id, created_at;

-- Update order_index for all project images based on creation time
-- This ensures existing projects have proper ordering
UPDATE project_images 
SET order_index = (
  SELECT row_number 
  FROM (
    SELECT 
      id,
      ROW_NUMBER() OVER (PARTITION BY project_id ORDER BY created_at) as row_number
    FROM project_images
  ) as subquery
  WHERE subquery.id = project_images.id
);

-- Verify the fix
SELECT 
  project_id,
  name,
  order_index,
  created_at
FROM project_images 
ORDER BY project_id, order_index; 