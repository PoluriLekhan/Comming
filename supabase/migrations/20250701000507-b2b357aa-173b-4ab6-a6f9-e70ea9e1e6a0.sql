
-- Create subscribers table to store email subscriptions
CREATE TABLE public.subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public inserts (for subscription)
CREATE POLICY "Allow public email subscription" 
  ON public.subscribers 
  FOR INSERT 
  WITH CHECK (true);

-- Create policy to allow authenticated reads (for admin dashboard)
CREATE POLICY "Allow authenticated reads" 
  ON public.subscribers 
  FOR SELECT 
  TO authenticated 
  USING (true);

-- Create policy to allow authenticated deletes (for admin dashboard)
CREATE POLICY "Allow authenticated deletes" 
  ON public.subscribers 
  FOR DELETE 
  TO authenticated 
  USING (true);

-- Create admin_sessions table for admin authentication
CREATE TABLE public.admin_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_token TEXT UNIQUE NOT NULL,
  username TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Enable RLS on admin_sessions
ALTER TABLE public.admin_sessions ENABLE ROW LEVEL SECURITY;

-- Policy for admin sessions - only allow reads with valid session
CREATE POLICY "Allow session validation" 
  ON public.admin_sessions 
  FOR SELECT 
  USING (expires_at > now());

-- Create index for better performance
CREATE INDEX idx_subscribers_email ON public.subscribers(email);
CREATE INDEX idx_admin_sessions_token ON public.admin_sessions(session_token);
CREATE INDEX idx_admin_sessions_expires ON public.admin_sessions(expires_at);
