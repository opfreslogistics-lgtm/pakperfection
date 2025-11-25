-- Test query to see what's in orders table
SELECT id, order_number, user_id, created_at, current_status 
FROM orders 
LIMIT 5;
