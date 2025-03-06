
import { useState } from "react";
import { format } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { ChatMessage as MessageType } from "@/hooks/useMessages";
import { Reply, MoreVertical, Copy, Trash, Bot } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ChatMessageProps {
  message: MessageType;
  onDelete?: (messageId: string) => void;
  onReply?: (message: MessageType) => void;
}

export default function ChatMessage({ message, onDelete, onReply }: ChatMessageProps) {
  const [showControls, setShowControls] = useState(false);
  const { toast } = useToast();
  
  const formattedTime = format(new Date(message.timestamp), "h:mm a");
  const isAi = message.senderName?.includes("GPT") || 
               message.senderName?.includes("Claude") || 
               message.senderName?.includes("Gemini") ||
               message.senderName?.includes("Perplexity") ||
               message.senderName?.includes("DeepSeek") ||
               message.senderName?.includes("Llama") ||
               message.senderName?.includes("Mistral") ||
               message.senderName?.includes("Copilot");
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(message.content);
    toast({
      title: "Copied to clipboard",
      description: "Message content copied to clipboard"
    });
  };
  
  return (
    <div 
      className={`group flex ${message.isOwnMessage ? 'justify-end' : 'justify-start'}`}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      {!message.isOwnMessage && (
        <Avatar className="h-10 w-10 mr-4">
          <AvatarImage src={message.senderAvatar} alt={message.senderName} isAi={isAi} />
          <AvatarFallback isAi={isAi}>
            {isAi ? null : message.senderName?.charAt(0)}
          </AvatarFallback>
        </Avatar>
      )}
      
      <div className={`flex flex-col max-w-[75%] ${message.isOwnMessage ? 'items-end' : 'items-start'}`}>
        {message.replyTo && (
          <div className={`flex items-center text-xs mb-1 ${message.isOwnMessage ? 'justify-end' : 'justify-start'}`}>
            <Reply className="h-3 w-3 mr-1" />
            <span className="text-muted-foreground mr-1">Replying to {message.replyTo.senderName}:</span>
            <span className="truncate max-w-[150px]">{message.replyTo.content}</span>
          </div>
        )}
        
        <div className="flex items-start group">
          <div 
            className={`rounded-lg px-4 py-2 ${
              message.isOwnMessage 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-muted'
            }`}
          >
            {!message.isOwnMessage && (
              <p className="text-xs font-medium mb-1">{message.senderName}</p>
            )}
            <p className="whitespace-pre-wrap">{message.content}</p>
            <p className="text-xs opacity-70 mt-1 text-right">{formattedTime}</p>
          </div>
          
          {showControls && (
            <div className={`flex items-center ${message.isOwnMessage ? 'ml-2' : 'mr-2 order-first'}`}>
              {onReply && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => onReply(message)}
                >
                  <Reply className="h-4 w-4" />
                </Button>
              )}
              
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={copyToClipboard}
              >
                <Copy className="h-4 w-4" />
              </Button>
              
              {message.isOwnMessage && onDelete && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem 
                      className="text-destructive focus:text-destructive"
                      onClick={() => onDelete(message.id)}
                    >
                      <Trash className="h-4 w-4 mr-2" />
                      Delete Message
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          )}
        </div>
      </div>
      
      {message.isOwnMessage && (
        <Avatar className="h-10 w-10 ml-4">
          <AvatarImage src={message.senderAvatar} alt={message.senderName} />
          <AvatarFallback>{message.senderName?.charAt(0)}</AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}
