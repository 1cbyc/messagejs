-- Add a check constraint to ensure MessageLog's projectId matches the projectId of the associated Service.
-- This prevents orphaned MessageLogs and ensures data integrity at the database level.

-- Note: Using a trigger instead of a CHECK constraint for better performance.
-- CHECK constraints evaluate subqueries for every row, which can be expensive.
-- Triggers only execute when data is inserted/updated, with optimized query patterns.

CREATE OR REPLACE FUNCTION validate_message_log_project_match()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if the service belongs to the same project as the message log
  IF NOT EXISTS (
    SELECT 1 FROM "Service" 
    WHERE "id" = NEW."serviceId" 
    AND "projectId" = NEW."projectId"
  ) THEN
    RAISE EXCEPTION 'Service % does not belong to project %', NEW."serviceId", NEW."projectId";
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER message_log_project_service_match
BEFORE INSERT OR UPDATE ON "MessageLog"
FOR EACH ROW
EXECUTE FUNCTION validate_message_log_project_match();

