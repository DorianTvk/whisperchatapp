
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

export default function NewChatButton() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { ais } = useAuth();

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
            {ais.map((ai) => (
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
