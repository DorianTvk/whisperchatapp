
-- Create friend_requests table
CREATE TABLE IF NOT EXISTS public.friend_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE(sender_id, receiver_id)
);

-- Add Row Level Security
ALTER TABLE public.friend_requests ENABLE ROW LEVEL SECURITY;

-- Policy for selecting friend requests - users can see their own sent or received
CREATE POLICY "Users can view their own friend requests" 
  ON public.friend_requests 
  FOR SELECT 
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- Policy for inserting friend requests - users can only send requests
CREATE POLICY "Users can send friend requests" 
  ON public.friend_requests 
  FOR INSERT 
  WITH CHECK (auth.uid() = sender_id);

-- Policy for updating friend requests - only receiver can update the status
CREATE POLICY "Receivers can update friend request status" 
  ON public.friend_requests 
  FOR UPDATE 
  USING (auth.uid() = receiver_id);

-- Policy for deleting friend requests - users can delete requests they are involved in
CREATE POLICY "Users can delete their own friend requests" 
  ON public.friend_requests 
  FOR DELETE 
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);
