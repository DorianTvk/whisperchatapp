
import { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
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
import { ArrowLeft, MoreVertical, Bot, Search, Info, Trash, BellOff, Sparkles } from "lucide-react";

export default function AIChat() {
  const { aiId } = useParams<{ aiId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, ais } = useAuth();
  
  const { messages, isLoading, sendMessage, deleteMessage, deleteChat } = useMessages(aiId || "", true);
  const [searchText, setSearchText] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [filteredMessages, setFilteredMessages] = useState<MessageType[]>([]);
  const [showAiInfo, setShowAiInfo] = useState(false);
  const [firstMessage, setFirstMessage] = useState(true);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  
  const ai = ais.find(a => a.id === aiId);

  useEffect(() => {
    if (!ai) {
      navigate("/dashboard");
      return;
    }
  }, [aiId, navigate, ai]);

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

  useEffect(() => {
    // Send welcome message if this is the first time chatting with this AI
    if (ai && messages.length === 0 && firstMessage) {
      setFirstMessage(false);
      // Create a mock AI welcome message
      const mockAiResponse = generateWelcomeMessage(ai);
      setTimeout(() => {
        const mockMessage: MessageType = {
          id: `msg_${Date.now()}`,
          chatId: ai.id,
          senderId: ai.id,
          senderName: ai.name,
          senderAvatar: ai.avatar,
          content: mockAiResponse,
          timestamp: new Date().toISOString(),
          isRead: true,
          isOwnMessage: false
        };
        sendMessage(mockAiResponse);
      }, 1000);
    }
  }, [ai, messages.length, firstMessage]);

  const generateWelcomeMessage = (ai: any) => {
    switch (ai.name) {
      case "ChatGPT":
        return "Hi! I'm ChatGPT, an AI assistant developed by OpenAI. I'm here to help answer your questions, provide information, assist with writing, or just chat. How can I help you today?";
      case "Claude":
        return "Hello! I'm Claude, an AI assistant made by Anthropic. I'm designed to be helpful, harmless, and honest. I can help with a wide range of tasks including answering questions, creative writing, and more. What would you like to talk about?";
      case "Gemini":
        return "Hi there! I'm Gemini, Google's multimodal AI. I can understand and reason about text, images, and code. I'm here to assist with your questions, creative projects, or anything else you'd like to explore. How can I help you today?";
      case "Perplexity":
        return "Hello! I'm Perplexity AI, designed to help you search and discover information with real-time citations. I can find relevant information from across the web and provide sources for further reading. What would you like to learn about?";
      case "DeepSeek":
        return "Greetings! I'm DeepSeek, an advanced AI model specialized in reasoning and problem-solving. I excel at technical tasks, coding challenges, and complex problems. How can I assist you today?";
      case "Llama":
        return "Hello! I'm Llama, Meta's open-source AI assistant. I'm built on a foundation of publicly available knowledge and can help with a wide range of tasks. What can I help you with today?";
      case "Mistral":
        return "Hi there! I'm Mistral, a powerful yet efficient AI model. I'm designed to provide helpful, accurate responses while being computationally efficient. What would you like assistance with today?";
      case "Copilot":
        return "Hello! I'm GitHub Copilot, your AI programming assistant. I can help you write code, suggest implementations, fix bugs, and explain technical concepts. What coding challenge are you working on today?";
      default:
        return `Hello! I'm ${ai.name}, an AI assistant ready to help you. How can I assist you today?`;
    }
  };

  const handleSendMessage = (content: string) => {
    if (!user || !ai) return;
    
    // Send user message
    sendMessage(content);
    
    // Simulate AI response
    setTimeout(() => {
      const aiResponse = simulateAIResponse(content, ai);
      
      // Create a mock AI response message
      const mockMessage: MessageType = {
        id: `msg_${Date.now() + 1}`,
        chatId: ai.id,
        senderId: ai.id,
        senderName: ai.name,
        senderAvatar: ai.avatar,
        content: aiResponse,
        timestamp: new Date().toISOString(),
        isRead: true,
        isOwnMessage: false
      };
      
      sendMessage(aiResponse, undefined, mockMessage);
    }, 1500);
  };

  const simulateAIResponse = (userMessage: string, ai: any) => {
    // Very simple response generator - in a real app this would call API endpoints
    const responses = [
      `I understand you're asking about "${userMessage.substring(0, 30)}...". Let me help with that.`,
      `Thanks for your message. From what I understand about "${userMessage.substring(0, 20)}...", here's what I can tell you...`,
      `That's an interesting question about "${userMessage.substring(0, 25)}...". Let me explain...`,
      `I see you're interested in learning about "${userMessage.substring(0, 20)}...". Here's what I know...`,
      `Regarding "${userMessage.substring(0, 30)}...", I can provide the following information...`
    ];
    
    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
    const aiSpecificAddition = `\n\nAs ${ai.name}, I specialize in ${ai.capabilities.join(", ")}. Based on my training, I can tell you that this topic ${Math.random() > 0.5 ? "is well-documented" : "has some interesting nuances"}.`;
    
    return randomResponse + aiSpecificAddition;
  };

  const handleDeleteMessage = (messageId: string) => {
    deleteMessage(messageId);
  };

  if (!ai || !user) return null;

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
            
            <div className="flex items-center cursor-pointer" onClick={() => setShowAiInfo(true)}>
              <Avatar className="h-9 w-9">
                <AvatarImage src={ai.avatar} alt={ai.name} />
                <AvatarFallback>
                  <Bot className="h-5 w-5" />
                </AvatarFallback>
              </Avatar>
              
              <div className="ml-3">
                <div className="flex items-center">
                  <h2 className="font-medium text-sm">{ai.name}</h2>
                  {ai.isAvailable && (
                    <span className="ml-2 h-2 w-2 rounded-full bg-green-500"></span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {ai.provider}
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
              <Sparkles className="h-4 w-4" />
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[200px]">
                <DropdownMenuItem onClick={() => setShowAiInfo(true)}>
                  <Info className="h-4 w-4 mr-2" />
                  AI information
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
                    <AvatarImage src={ai.avatar} alt={ai.name} />
                    <AvatarFallback>
                      <Bot className="h-8 w-8" />
                    </AvatarFallback>
                  </Avatar>
                  <h3 className="text-lg font-medium mb-2">{ai.name}</h3>
                  <p className="text-muted-foreground mb-6 max-w-md">
                    This is the beginning of your conversation with {ai.name}.
                    Ask a question to get started!
                  </p>
                  <div className="flex flex-wrap justify-center gap-2 max-w-md mb-4">
                    {ai.capabilities.map((capability, idx) => (
                      <Badge key={idx} variant="outline" className="bg-primary/5">
                        {capability}
                      </Badge>
                    ))}
                  </div>
                  <Button onClick={() => handleSendMessage(`Hi ${ai.name}, what can you help me with today?`)}>
                    Start Conversation
                  </Button>
                </div>
              )
            ) : (
              filteredMessages.map((message) => (
                <ChatMessage 
                  key={message.id} 
                  message={message} 
                  onDelete={handleDeleteMessage}
                />
              ))
            )}
          </div>
        </ScrollArea>

        {/* Message Input */}
        <MessageInput onSendMessage={handleSendMessage} placeholder={`Message ${ai.name}...`} />
      </div>

      {/* AI Info Dialog */}
      <Dialog open={showAiInfo} onOpenChange={setShowAiInfo}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>About {ai.name}</DialogTitle>
            <DialogDescription>
              AI assistant details and capabilities
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex flex-col items-center gap-4 py-4">
            <Avatar className="h-24 w-24">
              <AvatarImage src={ai.avatar} alt={ai.name} />
              <AvatarFallback>
                <Bot className="h-12 w-12" />
              </AvatarFallback>
            </Avatar>
            
            <div className="text-center">
              <h3 className="text-lg font-medium">{ai.name}</h3>
              <p className="text-sm text-muted-foreground">{ai.provider}</p>
            </div>
            
            <div className="w-full">
              <h4 className="text-sm font-medium mb-2">Description</h4>
              <p className="text-sm">{ai.description}</p>
              
              <h4 className="text-sm font-medium mt-4 mb-2">Capabilities</h4>
              <div className="flex flex-wrap gap-2">
                {ai.capabilities.map((capability, idx) => (
                  <Badge key={idx} variant="outline" className="bg-primary/5">
                    {capability}
                  </Badge>
                ))}
              </div>
              
              <div className="flex gap-2 pt-6">
                <Button onClick={() => setShowAiInfo(false)} className="flex-1">
                  Close
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
