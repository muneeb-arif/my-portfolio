-- Check user details for active localhost domain
SELECT u.id, u.email, u.name, u.full_name, d.name as domain_name, d.status
FROM users u 
INNER JOIN domains d ON u.id = d.user_id 
WHERE d.name = 'http://localhost:3000' AND d.status = 1; 