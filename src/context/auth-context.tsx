import { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User as SupabaseUser, AuthError } from "@supabase/supabase-js";
import { findUserByEmail, sendFriendRequestSafe } from "@/integrations/supabase/userService";

export type UserStatus = "online" | "away" | "busy" | "offline";

export type FriendRequestStatus = "pending" | "accepted" | "rejected";

export interface User {
  id: string;
  username: string;
  email: string;
  avatar: string;
  status: UserStatus;
  statusMessage?: string;
  bio?: string;
  createdAt: string;
  friends: string[]; // IDs of friends
  sentRequests: string[]; // IDs of users with pending friend requests
  receivedRequests: string[]; // IDs of users with pending friend requests
}

export interface Contact {
  id: string;
  name: string;
  email: string;
  avatar: string;
  status: UserStatus;
  statusMessage?: string;
  lastActive: string;
  requestStatus?: FriendRequestStatus;
}

export interface ChatGroup {
  id: string;
  name: string;
  avatar: string;
  description: string;
  members: string[]; // IDs of members
  createdBy: string; // ID of creator
  createdAt: string;
}

export interface AI {
  id: string;
  name: string;
  avatar: string;
  description: string;
  capabilities: string[];
  provider: string;
  isAvailable: boolean;
}

export interface FriendRequest {
  id: string;
  senderId: string;
  receiverId: string;
  status: FriendRequestStatus;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  contacts: Contact[];
  groups: ChatGroup[];
  ais: AI[];
  friendRequests: FriendRequest[];
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  updateAvatar: (avatarUrl: string) => Promise<void>;
  updateStatus: (status: UserStatus, message?: string) => Promise<void>;
  addContact: (email: string) => Promise<Contact>;
  removeContact: (contactId: string) => Promise<void>;
  createGroup: (name: string, members: string[]) => Promise<ChatGroup>;
  leaveGroup: (groupId: string) => Promise<void>;
  addToGroup: (groupId: string, userId: string) => Promise<void>;
  sendFriendRequest: (email: string) => Promise<void>;
  acceptFriendRequest: (requestId: string) => Promise<void>;
  rejectFriendRequest: (requestId: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Default avatar URLs
const DEFAULT_AVATARS = [
  "https://images.unsplash.com/photo-1649972904349-6e44c42644a7",
  "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158",
  "https://images.unsplash.com/photo-1581092795360-fd1ca04f0952",
  "https://images.unsplash.com/photo-1535268647677-300dbf3d78d1",
  "https://images.unsplash.com/photo-1582562124811-c09040d0a901"
];

// AI assistants - only ChatGPT
const INITIAL_AIS: AI[] = [
  {
    id: "ai_1",
    name: "ChatGPT",
    avatar: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/ChatGPT_logo.svg/800px-ChatGPT_logo.svg.png",
    description: "Advanced language model by OpenAI",
    capabilities: ["Text generation", "Creative writing", "Information retrieval"],
    provider: "OpenAI",
    isAvailable: true
  }
];

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [groups, setGroups] = useState<ChatGroup[]>([]);
  const [ais, setAis] = useState<AI[]>(INITIAL_AIS);
  const [isLoading, setIsLoading] = useState(true);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);

  // Load and set initial auth state
  useEffect(() => {
    const fetchInitialSession = async () => {
      try {
        // Get current session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          const userResponse = await supabase.auth.getUser();
          const supaUser = userResponse.data.user;
          setSupabaseUser(supaUser);
          
          if (supaUser) {
            // Fetch user profile from the profiles table
            const { data: profileData, error: profileError } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', supaUser.id)
              .single();
            
            if (profileError) {
              console.error("Error fetching profile:", profileError);
            } else if (profileData) {
              // Fetch contacts
              const { data: contactsData, error: contactsError } = await supabase
                .from('contacts')
                .select(`
                  contact_id,
                  profiles:contact_id(id, username, avatar, status, status_message, created_at)
                `)
                .eq('user_id', supaUser.id);
              
              const friends = contactsData ? contactsData.map(item => item.contact_id) || [] : [];
              const contactsList: Contact[] = [];
              
              if (contactsData && contactsData.length > 0) {
                contactsData.forEach(item => {
                  if (item.profiles) {
                    const profile = item.profiles as any;
                    contactsList.push({
                      id: profile.id,
                      name: profile.username,
                      email: "", // Email is protected and not accessible
                      avatar: profile.avatar || DEFAULT_AVATARS[0],
                      status: profile.status as UserStatus || "offline",
                      statusMessage: profile.status_message,
                      lastActive: profile.created_at || "Never"
                    });
                  }
                });
              }
              
              setContacts(contactsList);
              
              // Fetch friend requests
              await fetchFriendRequests(supaUser.id);
              
              // Create user object
              const userData: User = {
                id: supaUser.id,
                username: profileData.username,
                email: supaUser.email || "",
                avatar: profileData.avatar || DEFAULT_AVATARS[0],
                status: profileData.status as UserStatus || "online",
                statusMessage: profileData.status_message,
                bio: profileData.bio || "Hi there! I'm using Whisper.",
                createdAt: profileData.created_at,
                friends: friends,
                sentRequests: [],
                receivedRequests: []
              };
              
              setUser(userData);
            }
            
            // Fetch groups
            const { data: groupsData, error: groupsError } = await supabase
              .from('groups')
              .select(`
                id,
                name,
                avatar,
                description,
                created_by,
                created_at,
                members:group_members(user_id)
              `)
              .or(`created_by.eq.${supaUser.id},members.user_id.eq.${supaUser.id}`);
            
            if (!groupsError && groupsData) {
              const formattedGroups: ChatGroup[] = groupsData.map(group => ({
                id: group.id,
                name: group.name,
                avatar: group.avatar || DEFAULT_AVATARS[Math.floor(Math.random() * DEFAULT_AVATARS.length)],
                description: group.description,
                members: group.members.map((member: any) => member.user_id),
                createdBy: group.created_by,
                createdAt: group.created_at
              }));
              
              setGroups(formattedGroups);
            }
          }
        }
      } catch (error) {
        console.error("Session fetch error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialSession();

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          setSupabaseUser(session.user);
          
          // Fetch the user profile
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
          
          if (!error && profile) {
            // Fetch contacts
            const { data: contactsData } = await supabase
              .from('contacts')
              .select(`
                contact_id,
                profiles:contact_id(id, username, avatar, status, status_message, created_at)
              )
              .eq('user_id', session.user.id);
            
            const friends = contactsData ? contactsData.map(item => item.contact_id) || [] : [];
            const contactsList: Contact[] = [];
            
            if (contactsData && contactsData.length > 0) {
              contactsData.forEach(item => {
                if (item.profiles) {
                  const profile = item.profiles as any;
                  contactsList.push({
                    id: profile.id,
                    name: profile.username,
                    email: "", // Email is protected and not accessible
                    avatar: profile.avatar || DEFAULT_AVATARS[0],
                    status: profile.status as UserStatus || "offline",
                    statusMessage: profile.status_message,
                    lastActive: profile.created_at || "Never"
                  });
                }
              });
            }
            
            setContacts(contactsList);
            
            // Fetch friend requests
            await fetchFriendRequests(session.user.id);
            
            // Create user object
            const userData: User = {
              id: session.user.id,
              username: profile.username,
              email: session.user.email || "",
              avatar: profile.avatar || DEFAULT_AVATARS[0],
              status: profile.status as UserStatus || "online",
              statusMessage: profile.status_message,
              bio: profile.bio || "Hi there! I'm using Whisper.",
              createdAt: profile.created_at,
              friends: friends,
              sentRequests: [],
              receivedRequests: []
            };
            
            setUser(userData);
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setSupabaseUser(null);
          setContacts([]);
          setGroups([]);
          setFriendRequests([]);
        }
      }
    );

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchFriendRequests = async (userId: string) => {
    try {
      // Fetch sent requests
      const { data: sentRequestsData, error: sentError } = await supabase
        .from('friend_requests')
        .select(`
          id,
          sender_id,
          receiver_id,
          status,
          created_at,
          receiver:receiver_id(username, email, avatar)
        `)
        .eq('sender_id', userId);

      // Fetch received requests
      const { data: receivedRequestsData, error: receivedError } = await supabase
        .from('friend_requests')
        .select(`
          id,
          sender_id,
          receiver_id,
          status,
          created_at,
          sender:sender_id(username, email, avatar)
        `)
        .eq('receiver_id', userId);

      if (sentError) console.error("Error fetching sent requests:", sentError);
      if (receivedError) console.error("Error fetching received requests:", receivedError);

      const allRequests: FriendRequest[] = [];
      
      if (sentRequestsData) {
        sentRequestsData.forEach(request => {
          allRequests.push({
            id: request.id,
            senderId: request.sender_id,
            receiverId: request.receiver_id,
            status: request.status as FriendRequestStatus,
            createdAt: request.created_at
          });
        });
      }
      
      if (receivedRequestsData) {
        receivedRequestsData.forEach(request => {
          allRequests.push({
            id: request.id,
            senderId: request.sender_id,
            receiverId: request.receiver_id,
            status: request.status as FriendRequestStatus,
            createdAt: request.created_at
          });
        });
      }
      
      setFriendRequests(allRequests);
      
      // Update the user's sent and received request lists
      if (user) {
        const sentRequestIds = sentRequestsData?.map(req => req.receiver_id) || [];
        const receivedRequestIds = receivedRequestsData?.map(req => req.sender_id) || [];
        
        setUser({
          ...user,
          sentRequests: sentRequestIds,
          receivedRequests: receivedRequestIds
        });
      }
      
      // Update contacts with request status
      const updatedContacts: Contact[] = [...contacts];
      
      for (const contact of updatedContacts) {
        // Check if this contact has a pending sent request
        const sentRequest = sentRequestsData?.find(req => req.receiver_id === contact.id);
        if (sentRequest) {
          contact.requestStatus = sentRequest.status as FriendRequestStatus;
          continue;
        }
        
        // Check if this contact has a pending received request
        const receivedRequest = receivedRequestsData?.find(req => req.sender_id === contact.id);
        if (receivedRequest) {
          contact.requestStatus = receivedRequest.status as FriendRequestStatus;
        }
      }
      
      setContacts(updatedContacts);
      
    } catch (error) {
      console.error("Error in fetchFriendRequests:", error);
    }
  };

  const getRandomAvatar = () => {
    const randomIndex = Math.floor(Math.random() * DEFAULT_AVATARS.length);
    return DEFAULT_AVATARS[randomIndex];
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (username: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      // Try to sign up the user
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
          },
        },
      });
      
      if (error) throw error;
    } catch (error) {
      console.error("Registration failed:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const updateProfile = async (data: Partial<User>) => {
    setIsLoading(true);
    try {
      if (!user || !supabaseUser) throw new Error("Not authenticated");
      
      const updates = {
        username: data.username,
        bio: data.bio,
        status_message: data.statusMessage,
        updated_at: new Date().toISOString(),
      };
      
      // Remove undefined values
      Object.keys(updates).forEach(key => {
        if (updates[key as keyof typeof updates] === undefined) {
          delete updates[key as keyof typeof updates];
        }
      });
      
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);
      
      if (error) throw error;
      
      // Update local user state
      const updatedUser = { ...user, ...data };
      setUser(updatedUser);
    } catch (error) {
      console.error("Profile update failed:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateAvatar = async (avatarUrl: string) => {
    setIsLoading(true);
    try {
      if (!user || !supabaseUser) throw new Error("Not authenticated");
      
      const { error } = await supabase
        .from('profiles')
        .update({ avatar: avatarUrl })
        .eq('id', user.id);
      
      if (error) throw error;
      
      // Update local user state
      setUser({ ...user, avatar: avatarUrl });
    } catch (error) {
      console.error("Avatar update failed:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateStatus = async (status: UserStatus, message?: string) => {
    setIsLoading(true);
    try {
      if (!user || !supabaseUser) throw new Error("Not authenticated");
      
      const updates: any = { status };
      if (message !== undefined) {
        updates.status_message = message;
      }
      
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);
      
      if (error) throw error;
      
      // Update local user state
      setUser({
        ...user,
        status,
        statusMessage: message !== undefined ? message : user.statusMessage
      });
    } catch (error) {
      console.error("Status update failed:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const addContact = async (email: string): Promise<Contact> => {
    setIsLoading(true);
    try {
      if (!user || !supabaseUser) throw new Error("Not authenticated");
      
      // Don't allow adding yourself
      if (email.toLowerCase() === user.email.toLowerCase()) {
        throw new Error("You cannot add yourself as a contact");
      }

      // Use our safer method to send a friend request
      const requestResult = await sendFriendRequestSafe(user.id, email);
      
      if (!requestResult) {
        throw new Error("Failed to send friend request");
      }

      // Get the user's profile data
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', requestResult.receiverId)
        .single();
      
      if (profileError || !profileData) {
        console.error("Error fetching profile:", profileError);
        throw new Error("User not found");
      }
      
      // Create new contact object for the UI (with pending status)
      const newContact: Contact = {
        id: profileData.id,
        name: profileData.username,
        email: email,
        avatar: profileData.avatar || getRandomAvatar(),
        status: profileData.status as UserStatus || "offline",
        statusMessage: profileData.status_message,
        lastActive: "Never",
        requestStatus: "pending"
      };
      
      // Update friend requests list
      const newFriendRequest: FriendRequest = {
        id: requestResult.id,
        senderId: user.id,
        receiverId: requestResult.receiverId,
        status: 'pending',
        createdAt: requestResult.createdAt
      };
      
      setFriendRequests([...friendRequests, newFriendRequest]);
      
      // Update contacts list
      const updatedContacts: Contact[] = [...contacts, newContact];
      setContacts(updatedContacts);
      
      // Update user's sent requests
      setUser({
        ...user,
        sentRequests: [...user.sentRequests, requestResult.receiverId]
      });
      
      return newContact;
    } catch (error) {
      console.error("Add contact failed:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const removeContact = async (contactId: string) => {
    setIsLoading(true);
    try {
      if (!user || !supabaseUser) throw new Error("Not authenticated");
      
      // Remove from contacts table
      const { error } = await supabase
        .from('contacts')
        .delete()
        .eq('user_id', user.id)
        .eq('contact_id', contactId);
      
      if (error) throw error;
      
      // Also remove any friend requests between these users
      await supabase
        .from('friend_requests')
        .delete()
        .or(`(sender_id.eq.${user.id}.and.receiver_id.eq.${contactId}),(sender_id.eq.${contactId}.and.receiver_id.eq.${user.id})`);
      
      // Update contacts state
      const updatedContacts = contacts.filter(c => c.id !== contactId);
      setContacts(updatedContacts);
      
      // Update user's friends list
      const updatedUser = {
        ...user,
        friends: user.friends.filter(id => id !== contactId)
      };
      setUser(updatedUser);
      
      // Update friend requests state
      const updatedRequests = friendRequests.filter(
        req => !(req.senderId === user.id && req.receiverId === contactId) && 
               !(req.senderId === contactId && req.receiverId === user.id)
      );
      setFriendRequests(updatedRequests);
    } catch (error) {
      console.error("Remove contact failed:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const createGroup = async (name: string, members: string[]): Promise<ChatGroup> => {
    setIsLoading(true);
    try {
      if (!user || !supabaseUser) throw new Error("Not authenticated");
      
      // Insert group
      const { data: groupData, error: groupError } = await supabase
        .from('groups')
        .insert({
          name,
          description: `${name} group chat`,
          created_by: user.id,
          avatar: getRandomAvatar()
        })
        .select()
        .single();
      
      if (groupError || !groupData) throw groupError || new Error("Failed to create group");
      
      // Add members to group (including creator)
      const memberInserts = [...members, user.id].map(memberId => ({
        group_id: groupData.id,
        user_id: memberId
      }));
      
      const { error: membersError } = await supabase
        .from('group_members')
        .insert(memberInserts);
      
      if (membersError) throw membersError;
      
      // Create new group object
      const newGroup: ChatGroup = {
        id: groupData.id,
        name: groupData.name,
        avatar: groupData.avatar || getRandomAvatar(),
        description: groupData.description,
        members: [...members, user.id],
        createdBy: user.id,
        createdAt: groupData.created_at
      };
      
      // Update groups state
      setGroups([...groups, newGroup]);
      
      return newGroup;
    } catch (error) {
      console.error("Create group failed:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const leaveGroup = async (groupId: string) => {
    setIsLoading(true);
    try {
      if (!user || !supabaseUser) throw new Error("Not authenticated");
      
      const group = groups.find(g => g.id === groupId);
      if (!group) throw new Error("Group not found");
      
      // If user is the creator and there are other members, transfer ownership
      if (group.createdBy === user.id && group.members.length > 1) {
        const newOwnerId = group.members.find(id => id !== user.id);
        
        if (newOwnerId) {
          // Update group owner
          const { error: updateError } = await supabase
            .from('groups')
            .update({ created_by: newOwnerId })
            .eq('id', groupId);
          
          if (updateError) throw updateError;
        }
      }
      
      // Remove user from group members
      const { error: removeError } = await supabase
        .from('group_members')
        .delete()
        .eq('group_id', groupId)
        .eq('user_id', user.id);
      
      if (removeError) throw removeError;
      
      // If user was the only member, delete the group
      if (group.members.length === 1 && group.members[0] === user.id) {
        await supabase
          .from('groups')
          .delete()
          .eq('id', groupId);
      }
      
      // Update groups state
      const updatedGroups = groups.filter(g => g.id !== groupId);
      setGroups(updatedGroups);
    } catch (error) {
      console.error("Leave group failed:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const addToGroup = async (groupId: string, userId: string) => {
    setIsLoading(true);
    try {
      if (!user || !supabaseUser) throw new Error("Not authenticated");
      
      const group = groups.find(g => g.id === groupId);
      if (!group) throw new Error("Group not found");
      
      // Check if user is the creator of the group
      if (group.createdBy !== user.id) {
        throw new Error("Only the group creator can add members");
      }
      
      // Check if the user to be added exists
      const userExists = contacts.find(c => c.id === userId);
      if (!userExists) {
        throw new Error("User not found");
      }
      
      // Check if user is already a member
      if (group.members.includes(userId)) {
        throw new Error("User is already a member of this group");
      }
      
      // Add user to group
      const { error } = await supabase
        .from('group_members')
        .insert({
          group_id: groupId,
          user_id: userId
        });
      
      if (error) throw error;
      
      // Update groups state
      const updatedGroups = groups.map(g => {
        if (g.id === groupId) {
          return {
            ...g,
            members: [...g.members, userId]
          };
        }
        return g;
      });
      
      setGroups(updatedGroups);
    } catch (error) {
      console.error("Add to group failed:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const sendFriendRequest = async (email: string) => {
    try {
      if (!user || !supabaseUser) throw new Error("Not authenticated");
      
      // Use our helper function
      await sendFriendRequestSafe(user.id, email);
      
    } catch (error) {
      console.error("Send friend request failed:", error);
      throw error;
    }
  };

  const acceptFriendRequest = async (requestId: string) => {
    try {
      if (!user || !supabaseUser) throw new Error("Not authenticated");
      
      // Find the request
      const request = friendRequests.find(req => req.id === requestId);
      if (!request) throw new Error("Friend request not found");
      
      // Only the receiver can accept
      if (request.receiverId !== user.id) {
        throw new Error("You can't accept this request");
      }
      
      // Update the request status
      const { error: updateError } = await supabase
        .from('friend_requests')
        .update({ status: 'accepted' })
        .eq('id', requestId);
      
      if (updateError) throw updateError;
      
      // Add to contacts (both ways for bidirectional friendship)
      const { error: addContactError1 } = await supabase
        .from('contacts')
        .insert({
          user_id: user.id,
          contact_id: request.senderId
        });
      
      const { error: addContactError2 } = await supabase
        .from('contacts')
        .insert({
          user_id: request.senderId,
          contact_id: user.id
        });
      
      if (addContactError1) throw addContactError1;
      if (addContactError2) throw addContactError2;
      
      // Get the sender's profile data
      const { data: senderProfile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', request.senderId)
        .single();
      
      if (profileError || !senderProfile) throw new Error("Error fetching sender profile");
      
      // Update the friends list
      const updatedUser = {
        ...user,
        friends: [...user.friends, request.senderId],
        receivedRequests: user.receivedRequests.filter(id => id !== request.senderId)
      };
      setUser(updatedUser);
      
      // Update the friend requests
      const updatedRequests: FriendRequest[] = friendRequests.map(req => {
        if (req.id === requestId) {
          return { ...req, status: 'accepted' as FriendRequestStatus };
        }
        return req;
      });
      setFriendRequests(updatedRequests);
      
      // Add the sender to contacts if not already there
      const existingContact = contacts.find(c => c.id === request.senderId);
      if (!existingContact) {
        const newContact: Contact = {
          id: senderProfile.id,
          name: senderProfile.username,
          email: "",  // Email is protected
          avatar: senderProfile.avatar || DEFAULT_AVATARS[0],
          status: senderProfile.status as UserStatus || "offline",
          statusMessage: senderProfile.status_message,
          lastActive: senderProfile.created_at || "Never",
          requestStatus: 'accepted'
        };
        
        setContacts([...contacts, newContact]);
      } else {
        // Update the existing contact's request status
        const updatedContacts: Contact[] = contacts.map(c => {
          if (c.id === request.senderId) {
            return { ...c, requestStatus: 'accepted' as FriendRequestStatus };
          }
          return c;
        });
        setContacts(updatedContacts);
      }
      
    } catch (error) {
      console.error("Accept friend request failed:", error);
      throw error;
    }
  };

  const rejectFriendRequest = async (requestId: string) => {
    try {
      if (!user || !supabaseUser) throw new Error("Not authenticated");
      
      // Find the request
      const request = friendRequests.find(req => req.id === requestId);
      if (!request) throw new Error("Friend request not found");
      
      // Only the receiver can reject
      if (request.receiverId !== user.id) {
        throw new Error("You can't reject this request");
      }
      
      // Update the request status
      const { error: updateError } = await supabase
        .from('friend_requests')
        .update({ status: 'rejected' })
        .eq('id', requestId);
      
      if (updateError) throw updateError;
      
      // Update user's received requests
      setUser({
        ...user,
        receivedRequests: user.receivedRequests.filter(id => id !== request.senderId)
      });
      
      // Update the friend requests
      const updatedRequests: FriendRequest[] = friendRequests.map(req => {
        if (req.id === requestId) {
          return { ...req, status: 'rejected' as FriendRequestStatus };
        }
        return req;
      });
      setFriendRequests(updatedRequests);
      
      // Update any matching contact's request status
      const updatedContacts: Contact[] = contacts.map(c => {
        if (c.id === request.senderId) {
          return { ...c, requestStatus: 'rejected' as FriendRequestStatus };
        }
        return c;
      });
      setContacts(updatedContacts);
      
    } catch (error) {
      console.error("Reject friend request failed:", error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        contacts,
        groups,
        ais,
        friendRequests,
        login,
        register,
        logout,
        updateProfile,
        updateAvatar,
        updateStatus,
        addContact,
        removeContact,
        createGroup,
        leaveGroup,
        addToGroup,
        sendFriendRequest,
        acceptFriendRequest,
        rejectFriendRequest
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
