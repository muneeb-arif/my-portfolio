-- Enable localhost domain for muneebarif11@gmail.com
UPDATE domains 
SET status = 1 
WHERE user_id = 'e2e23b4c-2468-43b9-b12d-9bf73065d063' 
AND name = 'http://localhost:3000';

-- Verify the update
SELECT u.email, d.name, d.status 
FROM users u 
INNER JOIN domains d ON u.id = d.user_id 
WHERE u.email = 'muneebarif11@gmail.com'; 