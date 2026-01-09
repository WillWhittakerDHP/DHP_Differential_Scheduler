DELETE FROM active_blocks
WHERE id NOT IN (
  SELECT MIN(id)::uuid
  FROM active_blocks
  GROUP BY parent_id, child_id
);
