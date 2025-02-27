import { createContext, useContext, useState, useEffect } from "react";

export interface User {
  id: string;
  username: string;
  email: string;
  avatar: string;
  createdAt: string;
  friends?: string[];
}

export interface Contact {
  id: string;
  name: string;
  email: string;
  avatar: string;
  status: "online" | "offline" | "away";
  lastActive: string;
}

export interface ChatGroup {
  id: string;
  name: string;
  avatar: string;
  description: string;
  members: string[];
  createdBy: string;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  contacts: Contact[];
  groups: ChatGroup[];
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<void>;
  updateAvatar: (avatarUrl: string) => Promise<void>;
  addContact: (email: string) => Promise<Contact>;
  removeContact: (contactId: string) => Promise<void>;
  createGroup: (name: string, members: string[]) => Promise<ChatGroup>;
  leaveGroup: (groupId: string) => Promise<void>;
  addToGroup: (groupId: string, userId: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USER_STORAGE_KEY = "whisper-auth-user";
const CONTACTS_STORAGE_KEY = "whisper-contacts";
const GROUPS_STORAGE_KEY = "whisper-groups";

const DEFAULT_AVATARS = [
  "https://images.unsplash.com/photo-1649972904349-6e44c42644a7",
  "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158",
  "https://images.unsplash.com/photo-1581092795360-fd1ca04f0952",
  "https://images.unsplash.com/photo-1535268647677-300dbf3d78d1",
  "https://images.unsplash.com/photo-1582562124811-c09040d0a901"
];

const INITIAL_CONTACTS: Contact[] = [
  { id: "user_1", name: "Alex Johnson", email: "alex@example.com", avatar: "https://images.unsplash.com/photo-1649972904349-6e44c42644a7", status: "online", lastActive: "Now" },
  { id: "user_2", name: "Maria Garcia", email: "maria@example.com", avatar: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158", status: "offline", lastActive: "1h ago" },
  { id: "user_3", name: "James Smith", email: "james@example.com", avatar: "https://images.unsplash.com/photo-1581092795360-fd1ca04f0952", status: "away", lastActive: "30m ago" },
  { id: "user_4", name: "Emma Wilson", email: "emma@example.com", avatar: "https://images.unsplash.com/photo-1535268647677-300dbf3d78d1", status: "online", lastActive: "Now" }
];

const INITIAL_GROUPS: ChatGroup[] = [
  { 
    id: "group_1", 
    name: "Design Team", 
    avatar: "https://images.unsplash.com/photo-1582562124811-c09040d0a901", 
    description: "Our design team's discussions", 
    members: ["user_1", "user_2", "user_3", "user_4"], 
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
  },
  { 
    id: "group_3", 
    name: "Friends", 
    avatar: "https://images.unsplash.com/photo-1582562124811-c09040d0a901", 
    description: "Our friends group", 
    members: ["user_2", "user_4"], 
    createdBy: "user_2",
    createdAt: new Date().toISOString()
  }
];

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [groups, setGroups] = useState<ChatGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem(USER_STORAGE_KEY);
    const storedContacts = localStorage.getItem(CONTACTS_STORAGE_KEY);
    const storedGroups = localStorage.getItem(GROUPS_STORAGE_KEY);
    
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
      
      const existingContact = contacts.find(contact => contact.email.toLowerCase() === email.toLowerCase());
      
      const mockUser: User = {
        id: existingContact?.id || `user_${Date.now()}`,
        username: existingContact?.name || email.split('@')[0],
        email,
        avatar: existingContact?.avatar || getRandomAvatar(),
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
        createdAt: new Date().toISOString(),
        friends: [] // New users start with no friends
      };

      const newContact: Contact = {
        id: userId,
        name: username,
        email,
        avatar,
        status: "online",
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

  const addContact = async (email: string): Promise<Contact> => {
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      const existingContact = contacts.find(c => c.email.toLowerCase() === email.toLowerCase());
      if (existingContact) {
        throw new Error("Contact already exists");
      }
      
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
      
      if (user && user.friends) {
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
      
      const updatedContacts = contacts.filter(c => c.id !== contactId);
      setContacts(updatedContacts);
      localStorage.setItem(CONTACTS_STORAGE_KEY, JSON.stringify(updatedContacts));
      
      if (user && user.friends) {
        const updatedUser = { 
          ...user, 
          friends: user.friends.filter(id => id !== contactId) 
        };
        setUser(updatedUser);
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updatedUser));
      }
      
      const updatedGroups = groups.map(group => ({
        ...group,
        members: group.members.filter(id => id !== contactId)
      }));
      setGroups(updatedGroups);
      localStorage.setItem(GROUPS_STORAGE_KEY, JSON.stringify(updatedGroups));
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
      
      const newGroup: ChatGroup = {
        id: `group_${Date.now()}`,
        name,
        avatar: getRandomAvatar(),
        description: `Group created by ${user.username}`,
        members: [...members, user.id],
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
      
      const group = groups.find(g => g.id === groupId);
      if (!group) {
        throw new Error("Group not found");
      }
      
      if (group.createdBy === user.id) {
        const updatedGroups = groups.filter(g => g.id !== groupId);
        setGroups(updatedGroups);
        localStorage.setItem(GROUPS_STORAGE_KEY, JSON.stringify(updatedGroups));
      } else {
        const updatedGroups = groups.map(g => 
          g.id === groupId 
            ? { ...g, members: g.members.filter(id => id !== user.id) } 
            : g
        );
        setGroups(updatedGroups);
        localStorage.setItem(GROUPS_STORAGE_KEY, JSON.stringify(updatedGroups));
      }
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
      
      const group = groups.find(g => g.id === groupId);
      if (!group) {
        throw new Error("Group not found");
      }
      
      if (group.members.includes(userId)) {
        throw new Error("User is already in the group");
      }
      
      const updatedGroups = groups.map(g => 
        g.id === groupId 
          ? { ...g, members: [...g.members, userId] } 
          : g
      );
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
        login,
        register,
        logout,
        updateProfile,
        updateAvatar,
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
