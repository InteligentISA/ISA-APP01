CREATE TABLE IF NOT EXISTS chat_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL references public.profiles(id),
  session_id text,
  role text CHECK (role IN ('user', 'assistant')),
  message text,
  timestamp timestamptz DEFAULT now()
);

-- Optional: Index for faster queries by user/session
CREATE INDEX IF NOT EXISTS idx_chat_history_user_session ON chat_history (user_id, session_id); 