
import { createContext, useContext, useState, useEffect } from "react";

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
  logout: () => void;
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

// Storage keys
const USER_STORAGE_KEY = "whisper-auth-user";
const CONTACTS_STORAGE_KEY = "whisper-contacts";
const GROUPS_STORAGE_KEY = "whisper-groups";
const AIS_STORAGE_KEY = "whisper-ais";

// Default avatar URLs
const DEFAULT_AVATARS = [
  "https://images.unsplash.com/photo-1649972904349-6e44c42644a7",
  "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158",
  "https://images.unsplash.com/photo-1581092795360-fd1ca04f0952",
  "https://images.unsplash.com/photo-1535268647677-300dbf3d78d1",
  "https://images.unsplash.com/photo-1582562124811-c09040d0a901"
];

// Mock contacts
const INITIAL_CONTACTS: Contact[] = [
  { id: "user_1", name: "Alex Johnson", email: "alex@example.com", avatar: "https://images.unsplash.com/photo-1649972904349-6e44c42644a7", status: "online", lastActive: "Now" },
  { id: "user_2", name: "Maria Garcia", email: "maria@example.com", avatar: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158", status: "offline", lastActive: "1h ago" },
  { id: "user_3", name: "James Smith", email: "james@example.com", avatar: "https://images.unsplash.com/photo-1581092795360-fd1ca04f0952", status: "away", lastActive: "30m ago" },
  { id: "user_4", name: "Emma Wilson", email: "emma@example.com", avatar: "https://images.unsplash.com/photo-1535268647677-300dbf3d78d1", status: "online", lastActive: "Now" }
];

// Mock groups
const INITIAL_GROUPS: ChatGroup[] = [
  { 
    id: "group_1", 
    name: "Design Team", 
    avatar: "https://images.unsplash.com/photo-1582562124811-c09040d0a901", 
    description: "Our design team's discussions", 
    members: ["user_1", "user_2", "user_3"], 
    createdBy: "user_1",
    createdAt: new Date().toISOString()
  },
  { 
    id: "group_2", 
    name: "Project Alpha", 
    avatar: "https://images.unsplash.com/photo-1582562124811-c09040d0a901", 
    description: "Coordination for Project Alpha", 
    members: ["user_1", "user_3"], 
    createdBy: "user_3",
    createdAt: new Date().toISOString()
  }
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
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [groups, setGroups] = useState<ChatGroup[]>([]);
  const [ais, setAis] = useState<AI[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load stored data on mount
    const storedUser = localStorage.getItem(USER_STORAGE_KEY);
    const storedContacts = localStorage.getItem(CONTACTS_STORAGE_KEY);
    const storedGroups = localStorage.getItem(GROUPS_STORAGE_KEY);
    const storedAis = localStorage.getItem(AIS_STORAGE_KEY);
    
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    
    if (storedContacts) {
      setContacts(JSON.parse(storedContacts));
    } else {
      setContacts(INITIAL_CONTACTS);
      localStorage.setItem(CONTACTS_STORAGE_KEY, JSON.stringify(INITIAL_CONTACTS));
    }
    
    if (storedGroups) {
      setGroups(JSON.parse(storedGroups));
    } else {
      setGroups(INITIAL_GROUPS);
      localStorage.setItem(GROUPS_STORAGE_KEY, JSON.stringify(INITIAL_GROUPS));
    }
    
    if (storedAis) {
      setAis(JSON.parse(storedAis));
    } else {
      setAis(INITIAL_AIS);
      localStorage.setItem(AIS_STORAGE_KEY, JSON.stringify(INITIAL_AIS));
    }
    
    setIsLoading(false);
  }, []);

  const getRandomAvatar = () => {
    const randomIndex = Math.floor(Math.random() * DEFAULT_AVATARS.length);
    return DEFAULT_AVATARS[randomIndex];
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      // Check if user exists in contacts
      const existingContact = contacts.find(contact => contact.email.toLowerCase() === email.toLowerCase());
      
      const mockUser: User = {
        id: existingContact?.id || `user_${Date.now()}`,
        username: existingContact?.name || email.split('@')[0],
        email,
        avatar: existingContact?.avatar || getRandomAvatar(),
        status: "online",
        statusMessage: "Available",
        bio: "Hi there! I'm using Whisper.",
        createdAt: new Date().toISOString(),
        friends: ["user_1", "user_2", "user_3", "user_4"]
      };

      setUser(mockUser);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(mockUser));
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
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      const userId = `user_${Date.now()}`;
      const avatar = getRandomAvatar();
      
      const mockUser: User = {
        id: userId,
        username,
        email,
        avatar,
        status: "online",
        statusMessage: "Available",
        bio: "Hi there! I'm using Whisper.",
        createdAt: new Date().toISOString(),
        friends: [] // New users start with no friends
      };

      // Add the new user to contacts as well
      const newContact: Contact = {
        id: userId,
        name: username,
        email,
        avatar,
        status: "online",
        statusMessage: "Available",
        lastActive: "Now"
      };
      
      const updatedContacts = [...contacts, newContact];
      setContacts(updatedContacts);
      localStorage.setItem(CONTACTS_STORAGE_KEY, JSON.stringify(updatedContacts));

      setUser(mockUser);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(mockUser));
    } catch (error) {
      console.error("Registration failed:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(USER_STORAGE_KEY);
  };

  const updateProfile = async (data: Partial<User>) => {
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      if (user) {
        const updatedUser = { ...user, ...data };
        setUser(updatedUser);
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updatedUser));
        
        // If the username changed, update it in contacts too
        if (data.username) {
          const updatedContacts = contacts.map(contact => 
            contact.id === user.id 
              ? { ...contact, name: data.username as string } 
              : contact
          );
          setContacts(updatedContacts);
          localStorage.setItem(CONTACTS_STORAGE_KEY, JSON.stringify(updatedContacts));
        }
      }
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
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      if (user) {
        const updatedUser = { ...user, avatar: avatarUrl };
        setUser(updatedUser);
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updatedUser));
        
        // Update avatar in contacts too
        const updatedContacts = contacts.map(contact => 
          contact.id === user.id 
            ? { ...contact, avatar: avatarUrl } 
            : contact
        );
        setContacts(updatedContacts);
        localStorage.setItem(CONTACTS_STORAGE_KEY, JSON.stringify(updatedContacts));
      }
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
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      if (user) {
        const updatedUser = { 
          ...user, 
          status, 
          statusMessage: message || user.statusMessage 
        };
        setUser(updatedUser);
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updatedUser));
        
        // Update status in contacts too
        const updatedContacts = contacts.map(contact => 
          contact.id === user.id 
            ? { 
                ...contact, 
                status, 
                statusMessage: message || contact.statusMessage,
                lastActive: status === "offline" ? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Now"
              } 
            : contact
        );
        setContacts(updatedContacts);
        localStorage.setItem(CONTACTS_STORAGE_KEY, JSON.stringify(updatedContacts));
      }
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
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      // Check if contact already exists
      const existingContact = contacts.find(c => c.email.toLowerCase() === email.toLowerCase());
      if (existingContact) {
        throw new Error("Contact already exists");
      }
      
      // Create new contact
      const newContact: Contact = {
        id: `user_${Date.now()}`,
        name: email.split('@')[0],
        email,
        avatar: getRandomAvatar(),
        status: "offline",
        lastActive: "Never"
      };
      
      const updatedContacts = [...contacts, newContact];
      setContacts(updatedContacts);
      localStorage.setItem(CONTACTS_STORAGE_KEY, JSON.stringify(updatedContacts));
      
      // Add to user's friends
      if (user) {
        const updatedUser = { 
          ...user, 
          friends: [...user.friends, newContact.id] 
        };
        setUser(updatedUser);
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updatedUser));
      }
      
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
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      // Remove from contacts
      const updatedContacts = contacts.filter(c => c.id !== contactId);
      setContacts(updatedContacts);
      localStorage.setItem(CONTACTS_STORAGE_KEY, JSON.stringify(updatedContacts));
      
      // Remove from user's friends
      if (user) {
        const updatedUser = { 
          ...user, 
          friends: user.friends.filter(id => id !== contactId) 
        };
        setUser(updatedUser);
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updatedUser));
      }
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
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      if (!user) {
        throw new Error("You must be logged in to create a group");
      }
      
      // Create a new group
      const newGroup: ChatGroup = {
        id: `group_${Date.now()}`,
        name,
        avatar: getRandomAvatar(),
        description: `${name} group chat`,
        members: [...members, user.id], // Add the current user
        createdBy: user.id,
        createdAt: new Date().toISOString()
      };
      
      const updatedGroups = [...groups, newGroup];
      setGroups(updatedGroups);
      localStorage.setItem(GROUPS_STORAGE_KEY, JSON.stringify(updatedGroups));
      
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
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      if (!user) {
        throw new Error("You must be logged in to leave a group");
      }
      
      // Find the group
      const group = groups.find(g => g.id === groupId);
      if (!group) {
        throw new Error("Group not found");
      }
      
      // Check if user is part of the group
      if (!group.members.includes(user.id)) {
        throw new Error("You are not a member of this group");
      }
      
      // If user is the creator of the group and there are other members,
      // transfer ownership to the next member
      let updatedGroups;
      if (group.createdBy === user.id && group.members.length > 1) {
        const newOwner = group.members.find(id => id !== user.id) || group.members[0];
        const updatedGroup = {
          ...group,
          members: group.members.filter(id => id !== user.id),
          createdBy: newOwner
        };
        updatedGroups = groups.map(g => g.id === groupId ? updatedGroup : g);
      } 
      // If user is the only member or not the creator, just remove them from the group
      // or delete the group if they're the only member
      else if (group.members.length === 1) {
        updatedGroups = groups.filter(g => g.id !== groupId);
      } else {
        const updatedGroup = {
          ...group,
          members: group.members.filter(id => id !== user.id)
        };
        updatedGroups = groups.map(g => g.id === groupId ? updatedGroup : g);
      }
      
      setGroups(updatedGroups);
      localStorage.setItem(GROUPS_STORAGE_KEY, JSON.stringify(updatedGroups));
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
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      if (!user) {
        throw new Error("You must be logged in to add members");
      }
      
      // Find the group
      const group = groups.find(g => g.id === groupId);
      if (!group) {
        throw new Error("Group not found");
      }
      
      // Check if user is the creator of the group
      if (group.createdBy !== user.id) {
        throw new Error("Only the group creator can add members");
      }
      
      // Check if the user to be added exists
      const userToAdd = contacts.find(c => c.id === userId);
      if (!userToAdd) {
        throw new Error("User not found");
      }
      
      // Check if the user is already a member
      if (group.members.includes(userId)) {
        throw new Error("User is already a member of this group");
      }
      
      // Add the user to the group
      const updatedGroup = {
        ...group,
        members: [...group.members, userId]
      };
      
      const updatedGroups = groups.map(g => g.id === groupId ? updatedGroup : g);
      setGroups(updatedGroups);
      localStorage.setItem(GROUPS_STORAGE_KEY, JSON.stringify(updatedGroups));
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
