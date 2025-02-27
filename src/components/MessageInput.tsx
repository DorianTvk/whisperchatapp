
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Smile, PaperclipIcon, Mic, Send, Image, FileText, X } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface MessageInputProps {
  onSendMessage: (content: string) => void;
  placeholder?: string;
}

export default function MessageInput({ onSendMessage, placeholder = "Type a message..." }: MessageInputProps) {
  const [message, setMessage] = useState("");
  const [attachment, setAttachment] = useState<{ type: 'image' | 'file', name: string, url: string } | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Auto-resize the textarea
  useEffect(() => {
    if (textareaRef.current) {
      // Reset height to auto to get the correct scrollHeight
      textareaRef.current.style.height = "auto";
      // Set the height to scrollHeight
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [message]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSendMessage = () => {
    const trimmedMessage = message.trim();
    if (trimmedMessage || attachment) {
      let content = trimmedMessage;
      
      // Add attachment info to message if present
      if (attachment) {
        content += `\n\n[${attachment.type === 'image' ? 'Image' : 'File'}: ${attachment.name}](${attachment.url})`;
      }
      
      onSendMessage(content);
      setMessage("");
      setAttachment(null);
    }
  };

  const handleFileSelected = (type: 'image' | 'file') => {
    // In a real app, this would upload the file to a server
    // For demo purposes, we'll just simulate an attachment
    
    const fileNames = {
      image: ['photo.jpg', 'screenshot.png', 'vacation.jpg', 'meeting.jpg'],
      file: ['document.pdf', 'presentation.pptx', 'report.docx', 'spreadsheet.xlsx']
    };
    
    const randomName = fileNames[type][Math.floor(Math.random() * fileNames[type].length)];
    
    // Mock URL - in a real app this would be a real uploaded file URL
    const mockUrl = `https://example.com/uploads/${randomName}`;
    
    setAttachment({
      type,
      name: randomName,
      url: mockUrl
    });
  };

  return (
    <div className="px-4 py-3 border-t border-border/50 glass">
      {/* Attachment Preview */}
      {attachment && (
        <div className="mb-2 p-2 bg-muted/30 rounded-md flex items-center justify-between">
          <div className="flex items-center">
            {attachment.type === 'image' ? (
              <Image className="h-4 w-4 mr-2 text-primary" />
            ) : (
              <FileText className="h-4 w-4 mr-2 text-primary" />
            )}
            <span className="text-sm truncate max-w-[150px] sm:max-w-xs">
              {attachment.name}
            </span>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-6 w-6 rounded-full"
            onClick={() => setAttachment(null)}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      )}
      
      <div className="flex items-end space-x-2">
        <div className="flex-1 relative">
          <Textarea
            ref={textareaRef}
            placeholder={placeholder}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            className="min-h-10 max-h-40 resize-none py-3 pr-10 pl-3"
          />
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 bottom-1 h-8 w-8 rounded-full"
          >
            <Smile className="h-5 w-5 text-muted-foreground" />
          </Button>
        </div>
        
        <div className="flex items-center space-x-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <PaperclipIcon className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleFileSelected('image')}>
                <Image className="mr-2 h-4 w-4" />
                <span>Image</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleFileSelected('file')}>
                <FileText className="mr-2 h-4 w-4" />
                <span>Document</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button variant="ghost" size="icon" className="rounded-full">
            <Mic className="h-5 w-5" />
          </Button>
          
          <Button 
            variant="default" 
            size="icon" 
            className="rounded-full"
            onClick={handleSendMessage}
            disabled={!message.trim() && !attachment}
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
