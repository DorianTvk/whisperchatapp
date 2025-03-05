import { useState, useRef, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { ArrowLeft, MoreVertical, Bot, Search, Info, Trash, BellOff, Sparkles, Plus } from "lucide-react";

const AI_PERSONALITY_TRAITS = {
  "ChatGPT": {
    style: "helpful, clear, and concise",
    strengths: ["general knowledge", "writing assistance", "summarization"],
    quirks: "occasionally provides detailed explanations"
  },
  "Claude": {
    style: "thoughtful, nuanced, and safety-focused",
    strengths: ["reasoning", "longer discussions", "ethical considerations"],
    quirks: "tends to be more cautious and reflective"
  },
  "Gemini": {
    style: "versatile and multimodal",
    strengths: ["analyzing different types of input", "creative tasks", "problem-solving"],
    quirks: "references its ability to understand various formats"
  },
  "Perplexity": {
    style: "informative with real-time search capabilities",
    strengths: ["up-to-date information", "citation of sources", "research assistance"],
    quirks: "frequently cites external sources and references"
  },
  "DeepSeek": {
    style: "technically precise and analytical",
    strengths: ["complex problem solving", "code generation", "technical explanations"],
    quirks: "tends to dive deeply into technical details"
  },
  "Llama": {
    style: "open and community-oriented",
    strengths: ["general knowledge", "adaptability", "transparency about limitations"],
    quirks: "sometimes mentions its open-source nature"
  },
  "Mistral": {
    style: "efficient and precise",
    strengths: ["technical understanding", "succinct explanations", "logical reasoning"],
    quirks: "balances brevity with informativeness"
  },
  "Copilot": {
    style: "code-oriented and supportive",
    strengths: ["programming assistance", "debugging help", "technical documentation"],
    quirks: "frequently suggests code solutions and explanations"
  }
};

const RESPONSE_TEMPLATES = {
  factual: [
    "Based on my knowledge, {fact}. This is important because {reason}.",
    "I can tell you that {fact}. Many people find that {elaboration}.",
    "The answer is {fact}. To put this in context, {context}."
  ],
  opinion: [
    "While opinions vary on this topic, {perspective1}. However, others believe {perspective2}.",
    "This is a nuanced question. On one hand, {perspective1}. On the other hand, {perspective2}.",
    "There are multiple viewpoints here: {perspective1}. Alternatively, {perspective2}."
  ],
  creative: [
    "Here's something I came up with: {creative_content}. I hope this {purpose}!",
    "I've created this for you: {creative_content}. Does this {question}?",
    "How about this: {creative_content}. Feel free to ask for adjustments!"
  ],
  technical: [
    "From a technical perspective, {explanation}. This works because {reason}.",
    "The technical answer is {explanation}. A common approach is to {approach}.",
    "In technical terms, {explanation}. This is important because {importance}."
  ],
  unclear: [
    "I'm not completely sure what you're asking. Could you clarify if you're looking for {option1} or {option2}?",
    "I'd like to help, but I need a bit more information. Are you asking about {option1} or something else?",
    "To best assist you, could you provide more details about what you mean by {unclear_term}?"
  ]
};

export default function AIChat() {
  const { aiId } = useParams<{ aiId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { user, ais } = useAuth();
  
  const { messages, isLoading, sendMessage, deleteMessage, deleteChat } = useMessages(aiId || "", true);
  const [searchText, setSearchText] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [filteredMessages, setFilteredMessages] = useState<MessageType[]>([]);
  const [showAiInfo, setShowAiInfo] = useState(false);
  const [firstMessage, setFirstMessage] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  
  const ai = ais.find(a => a.id === aiId);

  const isNewChat = new URLSearchParams(location.search).get('new') === 'true';

  useEffect(() => {
    if (!ai) {
      navigate("/dashboard");
      return;
    }

    if (isNewChat) {
      const startNewChat = async () => {
        await deleteChat();
        navigate(`/ai/${aiId}`, { replace: true });
        setFirstMessage(true);
        toast({
          title: "New conversation started",
          description: `You're now chatting with ${ai.name}`
        });
      };
      
      startNewChat();
    }
  }, [aiId, navigate, ai, isNewChat, deleteChat]);

  useEffect(() => {
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
    if (scrollAreaRef.current && !searchText) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [filteredMessages, searchText, isTyping]);

  useEffect(() => {
    if (ai && (messages.length === 0) && firstMessage) {
      setFirstMessage(false);
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
        
        sendMessage(mockAiResponse, undefined, mockMessage);
      }, 1000);
    }
  }, [ai, messages.length, firstMessage, sendMessage]);

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
    
    sendMessage(content);
    
    setIsTyping(true);
    
    const responseTime = Math.floor(Math.random() * 500) + 1000;
    setTimeout(() => {
      const aiResponse = generateAIResponse(content, ai);
      
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
      setIsTyping(false);
    }, responseTime);
  };

  const generateAIResponse = (userMessage: string, ai: any) => {
    const messageType = categorizeMessage(userMessage);
    const aiPersonality = AI_PERSONALITY_TRAITS[ai.name] || {
      style: "helpful and informative",
      strengths: ["answering questions"],
      quirks: "provides useful information"
    };
    
    const templates = RESPONSE_TEMPLATES[messageType];
    const template = templates[Math.floor(Math.random() * templates.length)];
    
    let response = "";
    
    switch (messageType) {
      case "factual":
        response = template
          .replace("{fact}", generateFact(userMessage, ai))
          .replace("{reason}", "it helps us understand the context better")
          .replace("{elaboration}", "this information provides valuable insight")
          .replace("{context}", "this is a commonly discussed topic");
        break;
      
      case "opinion":
        response = template
          .replace("{perspective1}", "some experts believe this is beneficial")
          .replace("{perspective2}", "others point out potential drawbacks");
        break;
      
      case "creative":
        response = template
          .replace("{creative_content}", generateCreativeContent(userMessage, ai))
          .replace("{purpose}", "inspires your creativity")
          .replace("{question}", "meet your expectations");
        break;
      
      case "technical":
        response = template
          .replace("{explanation}", generateTechnicalExplanation(userMessage, ai))
          .replace("{reason}", "it follows established principles")
          .replace("{approach}", "break down the problem into smaller parts")
          .replace("{importance}", "it impacts how we approach similar problems");
        break;
      
      case "unclear":
        const keywords = userMessage.split(" ").filter(word => word.length > 4);
        const term1 = keywords.length > 0 ? keywords[0] : "this topic";
        const term2 = keywords.length > 1 ? keywords[1] : "related information";
        
        response = template
          .replace("{option1}", term1)
          .replace("{option2}", term2)
          .replace("{unclear_term}", userMessage.substring(0, 20));
        break;
    }
    
    const personalityAddition = `\n\nAs an AI with ${aiPersonality.style} communication style, I ${Math.random() > 0.5 ? "excel at" : "specialize in"} ${aiPersonality.strengths.join(", ")}. Is there anything specific you'd like to know more about?`;
    
    return response + personalityAddition;
  };

  const categorizeMessage = (message: string): keyof typeof RESPONSE_TEMPLATES => {
    const lowercaseMsg = message.toLowerCase();
    
    if (lowercaseMsg.includes("what is") || 
        lowercaseMsg.includes("who is") || 
        lowercaseMsg.includes("when did") || 
        lowercaseMsg.includes("where is") ||
        lowercaseMsg.includes("how many")) {
      return "factual";
    }
    
    if (lowercaseMsg.includes("do you think") || 
        lowercaseMsg.includes("what do you believe") || 
        lowercaseMsg.includes("your opinion") || 
        lowercaseMsg.includes("better") ||
        lowercaseMsg.includes("best")) {
      return "opinion";
    }
    
    if (lowercaseMsg.includes("create") || 
        lowercaseMsg.includes("generate") || 
        lowercaseMsg.includes("write") || 
        lowercaseMsg.includes("design") ||
        lowercaseMsg.includes("story") ||
        lowercaseMsg.includes("poem")) {
      return "creative";
    }
    
    if (lowercaseMsg.includes("how to") || 
        lowercaseMsg.includes("how do") || 
        lowercaseMsg.includes("explain") || 
        lowercaseMsg.includes("code") ||
        lowercaseMsg.includes("function") ||
        lowercaseMsg.includes("program")) {
      return "technical";
    }
    
    if (message.split(" ").length < 3 || message.endsWith("?")) {
      return "unclear";
    }
    
    return "factual";
  };

  const generateFact = (userMessage: string, ai: any) => {
    const topics = {
      technology: [
        "artificial intelligence continues to evolve rapidly with new models being developed every year",
        "quantum computing may eventually solve problems that are currently intractable for classical computers",
        "blockchain technology has applications beyond cryptocurrency, including supply chain management"
      ],
      science: [
        "black holes emit radiation, which is now known as Hawking radiation",
        "human DNA shares about 60% similarity with banana DNA",
        "the human brain processes information at roughly 120 meters per second"
      ],
      history: [
        "the ancient Egyptian pyramids at Giza were built over approximately 85 years",
        "the printing press was invented around 1440 by Johannes Gutenberg",
        "the Byzantine Empire lasted for more than a thousand years after the fall of the Western Roman Empire"
      ],
      arts: [
        "Leonardo da Vinci's Mona Lisa is painted on a poplar wood panel",
        "Shakespeare wrote approximately 37 plays and 154 sonnets",
        "Vincent van Gogh sold only one painting during his lifetime"
      ]
    };
    
    let relevantTopic: keyof typeof topics = "technology";
    const lowercaseMsg = userMessage.toLowerCase();
    
    if (lowercaseMsg.includes("history") || 
        lowercaseMsg.includes("ancient") || 
        lowercaseMsg.includes("war") || 
        lowercaseMsg.includes("empire")) {
      relevantTopic = "history";
    } else if (lowercaseMsg.includes("science") || 
               lowercaseMsg.includes("physics") || 
               lowercaseMsg.includes("biology") || 
               lowercaseMsg.includes("chemistry")) {
      relevantTopic = "science";
    } else if (lowercaseMsg.includes("art") || 
               lowercaseMsg.includes("music") || 
               lowercaseMsg.includes("literature") || 
               lowercaseMsg.includes("painting")) {
      relevantTopic = "arts";
    }
    
    const facts = topics[relevantTopic];
    return facts[Math.floor(Math.random() * facts.length)];
  };

  const generateCreativeContent = (userMessage: string, ai: any) => {
    const lowercaseMsg = userMessage.toLowerCase();
    
    if (lowercaseMsg.includes("story") || lowercaseMsg.includes("tale")) {
      return "In a world where dreams manifested as tangible objects, a young collector named Elias discovered an ancient dream hidden in his grandmother's attic. Unlike the others, this dream seemed to be aware of its surroundings...";
    }
    
    if (lowercaseMsg.includes("poem") || lowercaseMsg.includes("poetry")) {
      return "Silent whispers through autumn leaves,\nTime's gentle passage as daylight grieves.\nMemories dance on the edge of sleep,\nPromises made that the stars will keep.";
    }
    
    if (lowercaseMsg.includes("business") || lowercaseMsg.includes("startup")) {
      return "A subscription service that delivers personalized plant care kits based on the specific needs of your indoor plants, including seasonal nutrients, care tools, and AI-powered monitoring to ensure your plants thrive year-round.";
    }
    
    return "A concept for a digital garden that grows based on your daily habits and achievements. Each positive action in your life nurtures a virtual plant, creating a beautiful visual representation of your personal growth over time.";
  };

  const generateTechnicalExplanation = (userMessage: string, ai: any) => {
    const lowercaseMsg = userMessage.toLowerCase();
    
    if (lowercaseMsg.includes("code") || 
        lowercaseMsg.includes("program") || 
        lowercaseMsg.includes("develop")) {
      return "asynchronous functions in JavaScript allow operations to continue running while waiting for promises to resolve, which is crucial for handling tasks like API requests without blocking the main thread";
    }
    
    if (lowercaseMsg.includes("science") || 
        lowercaseMsg.includes("physics") || 
        lowercaseMsg.includes("chemistry")) {
      return "quantum entanglement occurs when pairs of particles interact in ways such that the quantum state of each particle cannot be described independently of the others, regardless of the distance separating them";
    }
    
    if (lowercaseMsg.includes("math") || 
        lowercaseMsg.includes("algorithm") || 
        lowercaseMsg.includes("calculation")) {
      return "the Fibonacci sequence has applications in numerous fields, from computer algorithms to financial markets, because its recursive pattern models many natural phenomena and optimization problems";
    }
    
    return "systems designed with redundancy incorporate backup components that can take over when primary components fail, which is a fundamental principle in creating robust infrastructure for critical applications";
  };

  const handleDeleteMessage = (messageId: string) => {
    deleteMessage(messageId);
  };

  if (!ai || !user) return null;

  return (
    <div className="flex h-screen bg-background/50">
      <div className="w-72 hidden md:block">
        <ChatSidebar />
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
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
                <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)] p-4 text-center">
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
              <>
                {filteredMessages.map((message) => (
                  <ChatMessage 
                    key={message.id} 
                    message={message} 
                    onDelete={handleDeleteMessage}
                  />
                ))}
                
                {isTyping && (
                  <div className="flex items-center">
                    <Avatar className="h-10 w-10 mr-4">
                      <AvatarImage src={ai.avatar} alt={ai.name} />
                      <AvatarFallback>
                        <Bot className="h-5 w-5" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex space-x-1 p-2 rounded-md bg-muted">
                      <div className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: "0ms" }}></div>
                      <div className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: "150ms" }}></div>
                      <div className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: "300ms" }}></div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </ScrollArea>

        <MessageInput onSendMessage={handleSendMessage} placeholder={`Message ${ai.name}...`} />
      </div>

      <Dialog open={showAiInfo} onOpenChange={setShowAiInfo}>
        <DialogContent className="sm:max-w-md">
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
              
              <div className="mt-4">
                <h4 className="text-sm font-medium mb-2">What can this AI do?</h4>
                <ul className="text-sm space-y-2">
                  <li className="flex items-start">
                    <span className="inline-block w-5 text-center mr-2">•</span>
                    <span>Answer questions and provide information</span>
                  </li>
                  <li className="flex items-start">
                    <span className="inline-block w-5 text-center mr-2">•</span>
                    <span>Generate creative content like stories and poems</span>
                  </li>
                  <li className="flex items-start">
                    <span className="inline-block w-5 text-center mr-2">•</span>
                    <span>Help with technical problems and coding tasks</span>
                  </li>
                  <li className="flex items-start">
                    <span className="inline-block w-5 text-center mr-2">•</span>
                    <span>Assist with various tasks based on its capabilities</span>
                  </li>
                </ul>
              </div>
              
              <div className="mt-6">
                <h4 className="text-sm font-medium mb-2">API Key Configuration</h4>
                <p className="text-xs text-muted-foreground mb-2">
                  To enhance this AI's capabilities, you can connect it to an API provider
                </p>
                <div className="space-y-2">
                  <div className="flex flex-col space-y-1">
                    <label htmlFor="api-key" className="text-xs font-medium">API Key for {ai.provider}</label>
                    <div className="flex gap-2">
                      <Input 
                        id="api-key" 
                        type="password" 
                        placeholder="Enter your API key"
                      />
                      <Button size="sm">Save</Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      This key will be stored securely and used only for this AI
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2 pt-6">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowAiInfo(false);
                    deleteChat();
                    navigate(`/ai/${ai.id}?new=true`);
                  }}
                  className="flex-1"
                >
                  New Chat
                </Button>
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
