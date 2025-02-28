
import { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User as SupabaseUser, AuthError } from "@supabase/supabase-js";

export type UserStatus = "online" | "away" | "busy" | "offline";

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
}

export interface Contact {
  id: string;
  name: string;
  email: string;
  avatar: string;
  status: UserStatus;
  statusMessage?: string;
  lastActive: string;
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

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  contacts: Contact[];
  groups: ChatGroup[];
  ais: AI[];
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

// AI assistants
const INITIAL_AIS: AI[] = [
  {
    id: "ai_1",
    name: "ChatGPT",
    avatar: "https://upload.wikimedia.org/wikipedia/commons/0/04/ChatGPT_logo.svg",
    description: "Advanced language model by OpenAI",
    capabilities: ["Text generation", "Creative writing", "Information retrieval"],
    provider: "OpenAI",
    isAvailable: true
  },
  {
    id: "ai_2",
    name: "Claude",
    avatar: "https://upload.wikimedia.org/wikipedia/commons/1/10/Claude_%28AI%29_logo.png",
    description: "Helpful AI assistant by Anthropic",
    capabilities: ["Safety", "Reasoning", "Long context"],
    provider: "Anthropic",
    isAvailable: true
  },
  {
    id: "ai_3",
    name: "Gemini",
    avatar: "https://seeklogo.com/images/G/google-gemini-logo-78B096E9B7-seeklogo.com.png",
    description: "Multimodal AI assistant by Google",
    capabilities: ["Multimodal understanding", "Code generation", "Problem solving"],
    provider: "Google",
    isAvailable: true
  },
  {
    id: "ai_4",
    name: "Perplexity",
    avatar: "https://upload.wikimedia.org/wikipedia/commons/8/87/Perplexity_ai_logo.png",
    description: "AI-powered search and discovery",
    capabilities: ["Real-time information", "Web search", "Citations"],
    provider: "Perplexity AI",
    isAvailable: true
  },
  {
    id: "ai_5",
    name: "DeepSeek",
    avatar: "https://res.cloudinary.com/crunchbase-production/image/upload/c_lpad,h_170,w_170,f_auto,b_white,q_auto:eco,dpr_1/pscugy6e2fcitnu9v6uh",
    description: "Advanced AI for complex tasks",
    capabilities: ["Deep reasoning", "Code generation", "Specialized knowledge"],
    provider: "DeepSeek AI",
    isAvailable: true
  },
  {
    id: "ai_6",
    name: "Llama",
    avatar: "https://static.cdnlogo.com/logos/l/82/llama-language-model.svg",
    description: "Open-source AI assistant by Meta",
    capabilities: ["Open-source", "Customizable", "Community support"],
    provider: "Meta",
    isAvailable: true
  },
  {
    id: "ai_7",
    name: "Mistral",
    avatar: "https://seeklogo.com/images/M/mistral-ai-logo-13009F56F2-seeklogo.com.png",
    description: "Efficient and powerful language model",
    capabilities: ["Efficiency", "Reasoning", "Technical expertise"],
    provider: "Mistral AI",
    isAvailable: true
  },
  {
    id: "ai_8",
    name: "Copilot",
    avatar: "https://upload.wikimedia.org/wikipedia/commons/4/48/Github_copilot.png",
    description: "AI-powered coding assistant",
    capabilities: ["Code completion", "Documentation", "Technical support"],
    provider: "GitHub/Microsoft",
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
                    const profile = item.profiles;
                    contactsList.push({
                      id: profile.id,
                      name: profile.username,
                      email: "", // Email is protected and not accessible
                      avatar: profile.avatar || DEFAULT_AVATARS[0],
                      status: profile.status as UserStatus || "offline",
                      statusMessage: profile.status_message,
                      lastActive: profile.last_active_at || "Never"
                    });
                  }
                });
              }
              
              setContacts(contactsList);
              
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
                friends: friends
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
              `)
              .eq('user_id', session.user.id);
            
            const friends = contactsData ? contactsData.map(item => item.contact_id) || [] : [];
            const contactsList: Contact[] = [];
            
            if (contactsData && contactsData.length > 0) {
              contactsData.forEach(item => {
                if (item.profiles) {
                  const profile = item.profiles;
                  contactsList.push({
                    id: profile.id,
                    name: profile.username,
                    email: "", // Email is protected and not accessible
                    avatar: profile.avatar || DEFAULT_AVATARS[0],
                    status: profile.status as UserStatus || "offline",
                    statusMessage: profile.status_message,
                    lastActive: profile.last_active_at || "Never"
                  });
                }
              });
            }
            
            setContacts(contactsList);
            
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
              friends: friends
            };
            
            setUser(userData);
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setSupabaseUser(null);
          setContacts([]);
          setGroups([]);
        }
      }
    );

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, []);

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
      
      // Find user by email
      const { data: foundUsers, error: searchError } = await supabase
        .from('profiles')
        .select(`
          id,
          username,
          avatar,
          status,
          status_message,
          created_at,
          users:id(email)
        `)
        .eq('users.email', email)
        .single();
      
      if (searchError || !foundUsers) {
        throw new Error("User not found");
      }
      
      // Check if already a contact
      const { data: existingContact, error: contactCheckError } = await supabase
        .from('contacts')
        .select('*')
        .eq('user_id', user.id)
        .eq('contact_id', foundUsers.id)
        .maybeSingle();
      
      if (existingContact) {
        throw new Error("Contact already exists");
      }
      
      // Add contact
      const { error: insertError } = await supabase
        .from('contacts')
        .insert({
          user_id: user.id,
          contact_id: foundUsers.id
        });
      
      if (insertError) throw insertError;
      
      // Create new contact object
      const newContact: Contact = {
        id: foundUsers.id,
        name: foundUsers.username,
        email: email,
        avatar: foundUsers.avatar || getRandomAvatar(),
        status: foundUsers.status as UserStatus || "offline",
        statusMessage: foundUsers.status_message,
        lastActive: "Never"
      };
      
      // Update contacts list
      const updatedContacts = [...contacts, newContact];
      setContacts(updatedContacts);
      
      // Update user's friends list
      const updatedUser = {
        ...user,
        friends: [...user.friends, newContact.id]
      };
      setUser(updatedUser);
      
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
      
      // Update contacts state
      const updatedContacts = contacts.filter(c => c.id !== contactId);
      setContacts(updatedContacts);
      
      // Update user's friends list
      const updatedUser = {
        ...user,
        friends: user.friends.filter(id => id !== contactId)
      };
      setUser(updatedUser);
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

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        contacts,
        groups,
        ais,
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
        addToGroup
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
