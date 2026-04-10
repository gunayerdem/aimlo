-- Player Memory table for cross-match AI coaching
CREATE TABLE IF NOT EXISTS player_memory (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  memory_data JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- RLS
ALTER TABLE player_memory ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own memory" ON player_memory
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own memory" ON player_memory
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own memory" ON player_memory
  FOR UPDATE USING (auth.uid() = user_id);

-- Index
CREATE INDEX IF NOT EXISTS idx_player_memory_user_id ON player_memory(user_id);
