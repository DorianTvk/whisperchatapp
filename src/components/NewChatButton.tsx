
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/auth-context";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bot, PlusCircle } from "lucide-react";

// AI Profile Pictures
const AI_AVATARS = {
  "ChatGPT": "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b",
  "Claude": "https://images.unsplash.com/photo-1518770660439-4636190af475",
  "Gemini": "https://images.unsplash.com/photo-1461749280684-dccba630e2f6",
  "Perplexity": "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158",
  "DeepSeek": "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5",
  "Llama": "https://images.unsplash.com/photo-1485827404703-89b55fcc595e",
  "Mistral": "https://images.unsplash.com/photo-1531297484001-80022131f5a1",
  "Copilot": "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d"
};

export default function NewChatButton() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { ais } = useAuth();

  // Assign avatars to AIs if they don't have one
  const enhancedAis = ais.map(ai => ({
    ...ai,
    avatar: ai.avatar || AI_AVATARS[ai.name] || "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5"
  }));

  const startNewChat = async (aiId: string) => {
    // Close the dialog
    setIsOpen(false);

    // Show loading toast
    toast({
      title: "Starting new chat...",
      description: "Creating a fresh conversation"
    });

    // Navigate to the AI chat page with query param to indicate new chat
    navigate(`/ai/${aiId}?new=true`);
  };

  return (
    <>
      <Button 
        variant="ghost" 
        className="flex items-center justify-start gap-2 w-full"
        onClick={() => setIsOpen(true)}
      >
        <PlusCircle className="h-4 w-4" />
        <span>New AI Chat</span>
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Start a new conversation</DialogTitle>
            <DialogDescription>
              Select an AI assistant to start a fresh conversation.
              This will create a new chat and delete previous messages.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-4 py-4">
            {enhancedAis.map((ai) => (
              <div 
                key={ai.id}
                className="flex flex-col items-center p-3 rounded-lg border border-border hover:bg-accent cursor-pointer transition-colors"
                onClick={() => startNewChat(ai.id)}
              >
                <Avatar className="h-12 w-12 mb-2">
                  <AvatarImage src={ai.avatar} alt={ai.name} />
                  <AvatarFallback>
                    <Bot className="h-6 w-6" />
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium">{ai.name}</span>
                <span className="text-xs text-muted-foreground">{ai.provider}</span>
              </div>
            ))}
          </div>

          <DialogFooter className="sm:justify-start">
            <Button variant="secondary" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
