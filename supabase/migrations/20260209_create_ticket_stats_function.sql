-- Create efficient RPC function for ticket stats
-- This replaces the inefficient client-side counting

CREATE OR REPLACE FUNCTION get_ticket_stats(user_id_param UUID DEFAULT NULL)
RETURNS JSON AS $$
  SELECT json_build_object(
    'total', COUNT(*),
    'open', COUNT(*) FILTER (WHERE status = 'open'),
    'in_progress', COUNT(*) FILTER (WHERE status = 'in_progress'),
    'resolved', COUNT(*) FILTER (WHERE status = 'resolved'),
    'closed', COUNT(*) FILTER (WHERE status = 'closed')
  )
  FROM tickets
  WHERE user_id_param IS NULL OR user_id = user_id_param;
$$ LANGUAGE sql SECURITY DEFINER;

-- Add comment
COMMENT ON FUNCTION get_ticket_stats IS 'Efficiently calculate ticket statistics using database aggregation instead of fetching all records';
