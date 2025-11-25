-- Add featured field to events table
ALTER TABLE events 
ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT FALSE;

-- Add index for featured events
CREATE INDEX IF NOT EXISTS idx_events_featured ON events(featured) WHERE featured = true;

-- Add index for event_date for better query performance
CREATE INDEX IF NOT EXISTS idx_events_date ON events(event_date);

