-- Create goals table for tracking financial goals
CREATE TABLE goals (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  target_amount INTEGER NOT NULL, -- Amount in cents
  current_amount INTEGER DEFAULT 0, -- Amount in cents
  target_date TEXT, -- ISO date string (optional)
  tag_pattern TEXT NOT NULL, -- Tag pattern to match (e.g., "goal_car")
  color TEXT DEFAULT '#3b82f6', -- Hex color for UI
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  tombstone INTEGER DEFAULT 0
);

-- Create index for efficient tag pattern lookups
CREATE INDEX idx_goals_tag_pattern ON goals(tag_pattern);
CREATE INDEX idx_goals_tombstone ON goals(tombstone);
