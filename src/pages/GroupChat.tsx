
import { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuPortal
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import ChatSidebar from "@/components/ChatSidebar";
import MessageInput from "@/components/MessageInput";
import ChatMessage, { Message } from "@/components/ChatMessage";
import { useAuth } from "@/context/auth-context";
import { ArrowLeft, MoreVertical, Phone, Video, Search, Users, Trash, Bell, BellOff, UserPlus, Info } from "lucide-react";

// Mock group data
const MOCK_GROUPS = {
  group_1: { 
    id: "group_1", 
    name: "Design Team", 
    avatar: "/placeholder.svg", 
    description: "Our design team's discussions, updates, and collaboration space.",
    members: [
      { id: "user_1", name: "Alex Johnson", avatar: "/placeholder.svg", role: "admin" },
      { id: "user_2", name: "Maria Garcia", avatar: "/placeholder.svg", role: "member" },
      { id: "user_3", name: "James Smith", avatar: "/placeholder.svg", role: "member" },
      { id: "user_4", name: "Emma Wilson", avatar: "/placeholder.svg", role: "member" },
      { id: "user_5", name: "Michael Brown", avatar: "/placeholder.svg", role: "member" },
      { id: "user_6", name: "Sophia Davis", avatar: "/placeholder.svg", role: "member" },
      { id: "user_7", name: "Oliver Taylor", avatar: "/placeholder.svg", role: "member" },
      { id: "user_8", name: "Isabella Martinez", avatar: "/placeholder.svg", role: "member" },
    ]
  },
  group_2: { 
    id: "group_2", 
    name: "Project Alpha", 
    avatar: "/placeholder.svg", 
    description: "Coordination for Project Alpha, our flagship product initiative.",
    members: [
      { id: "user_1", name: "Alex Johnson", avatar: "/placeholder.svg", role: "member" },
      { id: "user_3", name: "James Smith", avatar: "/placeholder.svg", role: "admin" },
      { id: "user_5", name: "Michael Brown", avatar: "/placeholder.svg", role: "member" },
      { id: "user_7", name: "Oliver Taylor", avatar: "/placeholder.svg", role: "member" },
      { id: "user_9", name: "Ava White", avatar: "/placeholder.svg", role: "member" },
    ]
  },
  group_3: { 
    id: "group_3", 
    name: "Friends", 
    avatar: "/placeholder.svg", 
    description: "Our personal group for hanging out, sharing, and staying connected.",
    members: [
      { id: "user_2", name: "Maria Garcia", avatar: "/placeholder.svg", role: "admin" },
      { id: "user_4", name: "Emma Wilson", avatar: "/placeholder.svg", role: "member" },
      { id: "user_6", name: "Sophia Davis", avatar: "/placeholder.svg", role: "member" },
      { id: "user_8", name: "Isabella Martinez", avatar: "/placeholder.svg", role: "member" },
      { id: "user_10", name: "Liam Johnson", avatar: "/placeholder.svg", role: "member" },
      { id: "user_11", name: "Noah Williams", avatar: "/placeholder.svg", role: "member" },
      { id: "user_12", name: "Olivia Jones", avatar: "/placeholder.svg", role: "member" },
      { id: "user_13", name: "Elijah Brown", avatar: "/placeholder.svg", role: "member" },
      { id: "user_14", name: "Charlotte Davis", avatar: "/placeholder.svg", role: "member" },
      { id: "user_15", name: "Amelia Miller", avatar: "/placeholder.svg", role: "member" },
      { id: "user_16", name: "Lucas Wilson", avatar: "/placeholder.svg", role: "member" },
      { id: "user_17", name: "Mia Moore", avatar: "/placeholder.svg", role: "member" },
    ]
  },
};

// Generate mock messages for a group
const generateGroupMockMessages = (groupId: string, currentUserId: string): Message[] => {
  const group = MOCK_GROUPS[groupId as keyof typeof MOCK_GROUPS];
  
  if (!group) return [];

  // Current time
  const now = new Date();
  
  // Get some members for messages
  const members = group.members.slice(0, 4);
  
  // Generate messages with various senders
  return [
    {
      id: "gmsg1",
      senderId: members[0].id,
      senderName: members[0].name,
      senderAvatar: members[0].avatar,
      content: "Hey team! I've been working on the latest design iterations for our project.",
      timestamp: new Date(now.getTime() - 3 * 60 * 60 * 1000).toISOString(), // 3 hours ago
      isRead: true,
      isOwnMessage: members[0].id === currentUserId,
    },
    {
      id: "gmsg2",
      senderId: members[1].id,
      senderName: members[1].name,
      senderAvatar: members[1].avatar,
      content: "Great! Can't wait to see what you've come up with.",
      timestamp: new Date(now.getTime() - 2.8 * 60 * 60 * 1000).toISOString(),
      isRead: true,
      isOwnMessage: members[1].id === currentUserId,
    },
    {
      id: "gmsg3",
      senderId: members[2].id,
      senderName: members[2].name,
      senderAvatar: members[2].avatar,
      content: "I've also been working on the user flow diagrams. Should we schedule a review session later this week?",
      timestamp: new Date(now.getTime() - 2.5 * 60 * 60 * 1000).toISOString(),
      isRead: true,
      isOwnMessage: members[2].id === currentUserId,
    },
    {
      id: "gmsg4",
      senderId: currentUserId,
      senderName: "You",
      senderAvatar: "/placeholder.svg",
      content: "That sounds like a good plan. How about Thursday afternoon?",
      timestamp: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
      isRead: true,
      isOwnMessage: true,
    },
    {
      id: "gmsg5",
      senderId: members[0].id,
      senderName: members[0].name,
      senderAvatar: members[0].avatar,
      content: "Thursday works for me. I'll share the design files in our shared folder before then so everyone has time to review.",
      timestamp: new Date(now.getTime() - 1.5 * 60 * 60 * 1000).toISOString(),
      isRead: true,
      isOwnMessage: members[0].id === currentUserId,
    },
    {
      id: "gmsg6",
      senderId: members[3].id,
      senderName: members[3].name,
      senderAvatar: members[3].avatar,
      content: "Perfect! I'm excited to see how this is all coming together.",
      timestamp: new Date(now.getTime() - 1 * 60 * 60 * 1000).toISOString(),
      isRead: true,
      isOwnMessage: members[3].id === currentUserId,
    },
    {
      id: "gmsg7",
      senderId: members[1].id,
      senderName: members[1].name,
      senderAvatar: members[1].avatar,
      content: "Me too! This project is really moving along nicely.",
      timestamp: new Date(now.getTime() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
      isRead: true,
      isOwnMessage: members[1].id === currentUserId,
    },
  ];
};

export default function GroupChat() {
  const { groupId } = useParams<{ groupId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [replyTo, setReplyTo] = useState<Message | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  
  const group = MOCK_GROUPS[groupId as keyof typeof MOCK_GROUPS];

  useEffect(() => {
    if (!group) {
      navigate("/dashboard");
      return;
    }
    
    // Load mock messages
    if (user) {
      setMessages(generateGroupMockMessages(groupId || "", user.id));
    }
  }, [groupId, user, navigate, group]);

  useEffect(() => {
    // Scroll to bottom when messages change
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages]);

  const handleSendMessage = (content: string) => {
    if (!user) return;
    
    const newMessage: Message = {
      id: `msg_${Date.now()}`,
      senderId: user.id,
      senderName: user.username,
      senderAvatar: user.avatar,
      content,
      timestamp: new Date().