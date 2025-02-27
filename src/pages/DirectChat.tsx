
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import ChatSidebar from "@/components/ChatSidebar";
import MessageInput from "@/components/MessageInput";
import ChatMessage from "@/components/ChatMessage";
import { useAuth } from "@/context/auth-context";
import { useMessages, ChatMessage as MessageType } from "@/hooks/useMessages";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, MoreVertical, Phone, Video, Search, UserCircle2, Trash, Bell, BellOff, UserMinus } from "lucide-react";

export default function DirectChat() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, contacts } = useAuth();
  
  const { messages, isLoading, sendMessage, deleteMessage, deleteChat } = useMessages(userId || "");
  const [replyTo, setReplyTo] = useState<MessageType | null>(null);
  const [searchText, setSearchText] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [filteredMessages, setFilteredMessages] = useState<MessageType[]>([]);
  const [showUserProfile, setShowUserProfile] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  
  const contact = contacts.find(c => c.id === userId);

  useEffect(() => {
    if (!contact) {
      navigate("/dashboard");
      return;
    }
  }, [userId, navigate, contact]);

  useEffect(() => {
    // Filter messages based on search text
    if (searchText) {
      setFilteredMessages(
        messages.filter(msg => 
          msg.content.toLowerCase().includes(searchText.toLowerCase())
        )
      );
    } else {
      setFilteredMessages(messages);
    }
  }, [searchText, messages]);

  useEffect(() => {
    // Scroll to bottom when messages change (if not searching)
    if (scrollAreaRef.current && !searchText) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [filteredMessages, searchText]);

  const handleSendMessage = (content: string) => {
    if (!user) return;
    
    // Create new message
    const newMessage: Partial<MessageType> = {
      content,
    };
    
    // Add reply information if replying to a message
    if (replyTo) {
      newMessage.replyTo = {
        id: replyTo.id,
        senderName: replyTo.senderName,
        content: replyTo.content
      };
    }
    
    sendMessage(content);
    setReplyTo(null);
  };

  const handleReply = (message: MessageType) => {
    setReplyTo(message);
  };

  const handleDeleteMessage = (messageId: string) => {
    deleteMessage(messageId);
  };

  const handleViewProfile = (userId: string) => {
    if (contact && contact.id === userId) {
      setShowUserProfile(true);
    } else if (user && user.id === userId) {
      navigate("/profile");
    }
  };

  if (!contact || !user) return null;

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
            
            <div className="flex items-center cursor-pointer" onClick={() => setShowUserProfile(true)}>
              <div className="relative">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={contact.avatar} alt={contact.name} />
                  <AvatarFallback>{contact.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <span 
                  className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background ${
                    contact.status === "online" ? "bg-green-500" : 
                    contact.status === "away" ? "bg-amber-500" :
                    contact.status === "busy" ? "bg-red-500" : "bg-muted"
                  }`}
                />
              </div>
              
              <div className="ml-3">
                <h2 className="font-medium text-sm">{contact.name}</h2>
                <p className="text-xs text-muted-foreground">
                  {contact.status === "online" ? "Online" : `Last seen ${contact.lastActive}`}
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-1">
            <Button 
              variant="ghost" 
              size="icon" 
              className="rounded-full"
              onClick={() => setShowSearch(!showSearch)}
            >
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
                <DropdownMenuItem onClick={() => setShowUserProfile(true)}>
                  <UserCircle2 className="h-4 w-4 mr-2" />
                  View profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setShowSearch(true)}>
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
                <DropdownMenuItem 
                  className="text-destructive focus:text-destructive"
                  onClick={() => {
                    deleteChat();
                    toast({
                      title: "Chat deleted",
                      description: "Conversation has been deleted"
                    });
                  }}
                >
                  <Trash className="h-4 w-4 mr-2" />
                  Delete conversation
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Search Bar (conditional) */}
        {showSearch && (
          <div className="px-4 py-2 flex items-center gap-2 border-b border-border/50 bg-background/80">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search in conversation..."
              className="flex-1 bg-transparent border-none outline-none text-sm"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              autoFocus
            />
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => {
                setSearchText("");
                setShowSearch(false);
              }}
            >
              Cancel
            </Button>
          </div>
        )}

        {/* Messages Area */}
        <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
          <div className="space-y-6 pb-4">
            {isLoading ? (
              <div className="flex justify-center p-4">
                <p className="text-muted-foreground">Loading messages...</p>
              </div>
            ) : filteredMessages.length === 0 ? (
              searchText ? (
                <div className="text-center py-10">
                  <p className="text-muted-foreground">No messages found matching "{searchText}"</p>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full p-4 text-center">
                  <Avatar className="h-16 w-16 mb-4">
                    <AvatarImage src={contact.avatar} alt={contact.name} />
                    <AvatarFallback>{contact.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <h3 className="text-lg font-medium mb-2">{contact.name}</h3>
                  <p className="text-muted-foreground mb-6 max-w-md">
                    This is the beginning of your conversation with {contact.name}.
                    Say hi to start the chat!
                  </p>
                  <Button onClick={() => handleSendMessage(`Hey ${contact.name}! 👋`)}>
                    Start Conversation
                  </Button>
                </div>
              )
            ) : (
              filteredMessages.map((message) => (
                <ChatMessage 
                  key={message.id} 
                  message={message} 
                  onReply={handleReply}
                  onDelete={handleDeleteMessage}
                  onViewProfile={handleViewProfile}
                />
              ))
            )}
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

      {/* User Profile Dialog */}
      <Dialog open={showUserProfile} onOpenChange={setShowUserProfile}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Profile Information</DialogTitle>
            <DialogDescription>
              Contact details for {contact.name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex flex-col items-center gap-4 py-4">
            <Avatar className="h-24 w-24">
              <AvatarImage src={contact.avatar} alt={contact.name} />
              <AvatarFallback>{contact.name.charAt(0)}</AvatarFallback>
            </Avatar>
            
            <div className="text-center">
              <h3 className="text-lg font-medium">{contact.name}</h3>
              <p className="text-sm text-muted-foreground">{contact.email}</p>
            </div>
            
            <div className="w-full">
              <Separator className="my-4" />
              
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium mb-1">Status</h4>
                  <div className="flex items-center">
                    <span 
                      className={`h-2.5 w-2.5 rounded-full mr-2 ${
                        contact.status === "online" ? "bg-green-500" : 
                        contact.status === "away" ? "bg-amber-500" : 
                        contact.status === "busy" ? "bg-red-500" : "bg-slate-500"
                      }`}
                    />
                    <p className="text-sm capitalize">
                      {contact.status === "online" ? "Online" : 
                       contact.status === "away" ? "Away" : 
                       contact.status === "busy" ? "Busy" : "Offline"}
                    </p>
                  </div>
                </div>
                
                {contact.statusMessage && (
                  <div>
                    <h4 className="text-sm font-medium mb-1">Status Message</h4>
                    <p className="text-sm">{contact.statusMessage}</p>
                  </div>
                )}
                
                <div>
                  <h4 className="text-sm font-medium mb-1">Last Active</h4>
                  <p className="text-sm">{contact.lastActive}</p>
                </div>
                
                <div className="flex gap-2 pt-4">
                  <Button onClick={() => setShowUserProfile(false)} className="flex-1">
                    Close
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
