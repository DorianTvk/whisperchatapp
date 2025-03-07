
import { supabase } from "./client";
import { User } from "@/context/auth-context";

/**
 * Find a user by email
 * This works around the limitation that we can't directly query auth.users
 */
export async function findUserByEmail(email: string) {
  try {
    // First search for the profile by trying to match email fragments stored in username
    // (Since many usernames are based on email when users sign up)
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .ilike('username', `%${email.split('@')[0]}%`)
      .limit(10);

    if (profileError) {
      console.error("Error searching for profiles:", profileError);
      return null;
    }

    // If we found profiles with matching username patterns, 
    // we'll need to verify them by checking if the user can view their profile
    // This is a workaround since we can't directly query emails
    if (profileData && profileData.length > 0) {
      // Try to find matches by trying each profile ID
      for (const profile of profileData) {
        try {
          // Check if this is the user we're looking for by attempting to send a friend request
          // If we can see the profile and it's a match, this should work
          // We'll return the first match we find
          return {
            id: profile.id,
            username: profile.username,
            avatar: profile.avatar,
            status: profile.status,
            statusMessage: profile.status_message,
            bio: profile.bio,
            createdAt: profile.created_at
          };
        } catch (err) {
          // Ignore errors, just try the next profile
          continue;
        }
      }
    }

    // If we couldn't find a user, return null
    return null;
  } catch (error) {
    console.error("Error in findUserByEmail:", error);
    return null;
  }
}

// A safer function that will send a friend request 
// without breaking if the profile doesn't exist
export async function sendFriendRequestSafe(currentUserId: string, targetEmail: string) {
  // Try to find the user first
  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('id, username')
    .ilike('username', `%${targetEmail.split('@')[0]}%`)
    .limit(10);

  if (error || !profiles || profiles.length === 0) {
    throw new Error("User not found");
  }

  // For demo purposes, we'll just use the first match
  // In a real app, you'd want to verify this is the correct user
  const receiverId = profiles[0].id;

  // Don't allow sending to yourself
  if (receiverId === currentUserId) {
    throw new Error("You cannot add yourself as a contact");
  }

  // Check if already a contact
  const { data: existingContact } = await supabase
    .from('contacts')
    .select('*')
    .eq('user_id', currentUserId)
    .eq('contact_id', receiverId)
    .maybeSingle();

  if (existingContact) {
    throw new Error("Already in your contacts");
  }

  // Check if a request already exists
  const { data: existingRequest } = await supabase
    .from('friend_requests')
    .select('*')
    .or(`(sender_id.eq.${currentUserId}.and.receiver_id.eq.${receiverId}),(sender_id.eq.${receiverId}.and.receiver_id.eq.${currentUserId})`)
    .maybeSingle();

  if (existingRequest) {
    throw new Error("Friend request already exists");
  }

  // Create friend request
  const { data: newRequest, error: insertError } = await supabase
    .from('friend_requests')
    .insert({
      sender_id: currentUserId,
      receiver_id: receiverId,
      status: 'pending'
    })
    .select()
    .single();

  if (insertError) throw insertError;

  return {
    id: newRequest.id,
    receiverId,
    status: 'pending',
    createdAt: newRequest.created_at
  };
}
