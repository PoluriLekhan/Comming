
-- Create a function to handle admin session creation without RLS issues
CREATE OR REPLACE FUNCTION create_admin_session(
  p_session_token TEXT,
  p_username TEXT,
  p_expires_at TIMESTAMP WITH TIME ZONE
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.admin_sessions (session_token, username, expires_at)
  VALUES (p_session_token, p_username, p_expires_at);
END;
$$;

-- Update RLS policy for admin_sessions to allow inserts through the function
DROP POLICY IF EXISTS "Allow session validation" ON public.admin_sessions;
DROP POLICY IF EXISTS "Allow admin session creation" ON public.admin_sessions;

-- Create policies for admin_sessions
CREATE POLICY "Allow session validation" 
  ON public.admin_sessions 
  FOR SELECT 
  USING (expires_at > now());

CREATE POLICY "Allow admin session creation" 
  ON public.admin_sessions 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Allow admin session deletion" 
  ON public.admin_sessions 
  FOR DELETE 
  USING (true);
