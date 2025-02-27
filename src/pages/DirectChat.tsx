
import { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import ChatSidebar from "@/components/ChatSidebar";
import MessageInput from "@/components/MessageInput";
import ChatMessage, { Message } from "@/components/ChatMessage";
import { useAuth } from "@/context/auth-context";
import { ArrowLeft, MoreVertical, Phone, Video, Search, Trash, Bell, BellOff, UserMinus } from "lucide-react";

// Mock user data
const MOCK_USERS = {
  user_1: { id: "user_1", name: "Alex Johnson", avatar: "/placeholder.svg", status: "online", lastSeen: "Now" },
  user_2: { id: "user_2", name: "Maria Garcia", avatar: "/placeholder.svg", status: "offline", lastSeen: "1h ago" },
  user_3: { id: "user_3", name: "James Smith", avatar: "/placeholder.svg", status: "away", lastSeen: "30m ago" },
  user_4: { id: "user_4", name: "Emma Wilson", avatar: "/placeholder.svg", status: "online", lastSeen: "Now" },
};

// Generate mock messages
const generateMockMessages = (userId: string, currentUserId: string): Message[] => {
  const userInfo = MOCK_USERS[userId as keyof typeof MOCK_USERS];
  
  if (!userInfo) return [];

  // Current time
  const now = new Date();
  
  // Generate messages over the past few hours
  return [
    {
      id: "msg1",
      senderId: userId,
      senderName: userInfo.name,
      senderAvatar: userInfo.avatar,
      content: "Hey there! How are you doing today?",
      timestamp: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
      isRead: true,
    },
    {
      id: "msg2",
      senderId: currentUserId,
      senderName: "You",
      senderAvatar: "/placeholder.svg",
      content: "I'm doing great, thanks for asking! Just working on a new project.",
      timestamp: new Date(now.getTime() - 1.9 * 60 * 60 * 1000).toISOString(),
      isRead: true,
      isOwnMessage: true,
    },
    {
      id: "msg3",
      senderId: userId,
      senderName: userInfo.name,
      senderAvatar: userInfo.avatar,
      content: "That sounds exciting! What kind of project is it?",
      timestamp: new Date(now.getTime() - 1.7 * 60 * 60 * 1000).toISOString(),
      isRead: true,
    },
    {
      id: "msg4",
      senderId: currentUserId,
      senderName: "You",
      senderAvatar: "/placeholder.svg",
      content: "It's a new chat application with a minimal design approach. Focusing a lot on user experience and simplicity.",
      timestamp: new Date(now.getTime() - 1.5 * 60 * 60 * 1000).toISOString(),
      isRead: true,
      isOwnMessage: true,
    },
    {
      id: "msg5",
      senderId: userId,
      senderName: userInfo.name,
      senderAvatar: userInfo.avatar,
      content: "That's right up my alley! I love minimalist design. Would love to see it when you're ready to share.",
      timestamp: new Date(now.getTime() - 20 * 60 * 1000).toISOString(), // 20 minutes ago
      isRead: true,
    },
    {
      id: "msg6",
      senderId: currentUserId,
      senderName: "You",
      senderAvatar: "/placeholder.svg",
      content: "Absolutely! I'll send you a preview as soon as I have something to show.",
      timestamp: new Date(now.getTime() - 10 * 60 * 1000).toISOString(), // 10 minutes ago
      isRead: true,
      isOwnMessage: true,
    },
  ];
};

export default function DirectChat() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [replyTo, setReplyTo] = useState<Message | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  
  const contact = MOCK_USERS[userId as keyof typeof MOCK_USERS];

  useEffect(() => {
    if (!contact) {
      navigate("/dashboard");
      return;
    }
    
    // Load mock messages
    if (user) {
      setMessages(generateMockMessages(userId || "", user.id));
    }
  }, [userId, user, navigate, contact]);

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
      timestamp: new Date().toISOString(),
      isRead: false,
      isOwnMessage: true,
    };
    
    setMessages((prev) => [...prev, newMessage]);
    setReplyTo(null);
  };

  const handleReply = (message: Message) => {
    setReplyTo(message);
  };

  const handleDeleteMessage = (messageId: string) => {
    setMessages((prev) => prev.filter((msg) => msg.id !== messageId));
  };

  if (!contact) return null;

  return (
    <div className="flex h-screen bg-background/50">
      {/* Sidebar */}
      <div className="w-72 hidden md:block">
        <ChatSidebar />
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Chat Header */}
        <header className="px-4 py-3 border-b border-border/50 glass flex items-center justify-between">
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              size="icon" 
              className="mr-2 md:hidden" 
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            
            <div className="flex items-center">
              <div className="relative">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={contact.avatar} alt={contact.name} />
                  <AvatarFallback>{contact.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <span 
                  className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background ${
                    contact.status === "online" ? "bg-green-500" : 
                    contact.status === "away" ? "bg-yellow-500" : "bg-muted"
                  }`}
                />
              </div>
              
              <div className="ml-3">
                <h2 className="font-medium text-sm">{contact.name}</h2>
                <p className="text-xs text-muted-foreground">
                  {contact.status === "online" ? "Online" : `Last seen ${contact.lastSeen}`}
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-1">
            <Button variant="ghost" size="icon" className="rounded-full">
              <Search className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Phone className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Video className="h-4 w-4" />
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[200px]">
                <DropdownMenuItem>
                  <Search className="h-4 w-4 mr-2" />
                  Search in conversation
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <BellOff className="h-4 w-4 mr-2" />
                  Mute notifications
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <UserMinus className="h-4 w-4 mr-2" />
                  Block user
                </DropdownMenuItem>
                <DropdownMenuItem className="text-destructive focus:text-destructive">
                  <Trash className="h-4 w-4 mr-2" />
                  Delete conversation
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Messages Area */}
        <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
          <div className="space-y-6 pb-4">
            {messages.map((message, index) => (
              <ChatMessage 
                key={message.id} 
                message={message} 
                onReply={handleReply}
                onDelete={handleDeleteMessage}
              />
            ))}
          </div>
        </ScrollArea>

        {/* Reply Indicator */}
        {replyTo && (
          <div className="px-4 py-2 border-t border-border/50 bg-background/80 animate-slide-in">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-1 h-6 bg-primary/50 rounded-full mr-2" />
                <div>
                  <span className="text-xs font-medium">
                    Replying to {replyTo.isOwnMessage ? "yourself" : replyTo.senderName}
                  </span>
                  <p className="text-xs text-muted-foreground truncate max-w-xs">
                    {replyTo.content}
                  </p>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-6 w-6 rounded-full"
                onClick={() => setReplyTo(null)}
              >
                <Trash className="h-3 w-3" />
              </Button>
            </div>
          </div>
        )}

        {/* Message Input */}
        <MessageInput onSendMessage={handleSendMessage} />
      </div>
    </div>
  );
}
