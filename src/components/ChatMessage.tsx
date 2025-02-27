
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { format } from "date-fns";
import { MoreVertical, Reply, Copy, Bookmark, Trash } from "lucide-react";

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  content: string;
  timestamp: string;
  isRead: boolean;
  isOwnMessage?: boolean;
}

interface ChatMessageProps {
  message: Message;
  onReply?: (message: Message) => void;
  onDelete?: (messageId: string) => void;
}

export default function ChatMessage({ message, onReply, onDelete }: ChatMessageProps) {
  const [showActions, setShowActions] = useState(false);
  
  const formattedTime = format(new Date(message.timestamp), "h:mm a");
  const formattedDate = format(new Date(message.timestamp), "MMM d");
  const isToday = format(new Date(message.timestamp), "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd");
  
  const displayTime = isToday ? formattedTime : `${formattedDate}, ${formattedTime}`;
  
  return (
    <div 
      className={`group flex items-start gap-3 max-w-full ${
        message.isOwnMessage ? "flex-row-reverse ml-auto" : ""
      }`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <Avatar className="h-8 w-8 mt-1">
        <AvatarImage src={message.senderAvatar} alt={message.senderName} />
        <AvatarFallback>{message.senderName.charAt(0)}</AvatarFallback>
      </Avatar>
      
      <div className={`flex flex-col max-w-[80%] ${message.isOwnMessage ? "items-end" : "items-start"}`}>
        {!message.isOwnMessage && (
          <span className="text-xs font-medium mb-1">{message.senderName}</span>
        )}
        
        <div className="flex items-end gap-2">
          {!message.isOwnMessage && showActions && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-7 w-7 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => onReply?.(message)}
            >
              <Reply className="h-3.5 w-3.5" />
            </Button>
          )}
          
          <div 
            className={`px-4 py-2.5 rounded-xl break-words message-in ${
              message.isOwnMessage 
                ? "bg-primary text-primary-foreground rounded-tr-none" 
                : "bg-accent text-accent-foreground rounded-tl-none"
            }`}
          >
            <p className="whitespace-pre-wrap text-sm">{message.content}</p>
          </div>
          
          {message.isOwnMessage && showActions && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-7 w-7 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => onReply?.(message)}
            >
              <Reply className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
        
        <div className={`flex items-center mt-1 text-xs text-muted-foreground ${
          message.isOwnMessage ? "flex-row-reverse" : ""
        }`}>
          <span>{displayTime}</span>
          
          {message.isOwnMessage && (
            <span className="mx-1">
              {message.isRead ? "Read" : "Delivered"}
            </span>
          )}
          
          {showActions && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-6 w-6 rounded-full ml-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <MoreVertical className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align={message.isOwnMessage ? "end" : "start"} className="w-[160px]">
                <DropdownMenuItem onClick={() => onReply?.(message)}>
                  <Reply className="h-4 w-4 mr-2" />
                  Reply
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigator.clipboard.writeText(message.content)}>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy text
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Bookmark className="h-4 w-4 mr-2" />
                  Save message
                </DropdownMenuItem>
                {message.isOwnMessage && (
                  <DropdownMenuItem 
                    className="text-destructive focus:text-destructive" 
                    onClick={() => onDelete?.(message.id)}
                  >
                    <Trash className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </div>
  );
}
