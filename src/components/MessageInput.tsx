
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Smile, PaperclipIcon, Mic, Send, Image, FileText, X, Loader2, StopCircle } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";

interface MessageInputProps {
  onSendMessage: (content: string) => void;
  placeholder?: string;
}

interface Attachment {
  type: 'image' | 'file' | 'voice';
  name: string;
  url: string;
  blob?: Blob;
}

export default function MessageInput({ onSendMessage, placeholder = "Type a message..." }: MessageInputProps) {
  const { toast } = useToast();
  const [message, setMessage] = useState("");
  const [attachment, setAttachment] = useState<Attachment | null>(null);
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);
  const [isFileDialogOpen, setIsFileDialogOpen] = useState(false);
  const [isVoiceRecording, setIsVoiceRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isSelectingFile, setIsSelectingFile] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recordingTimerRef = useRef<number | null>(null);
  
  // Auto-resize the textarea
  useEffect(() => {
    if (textareaRef.current) {
      // Reset height to auto to get the correct scrollHeight
      textareaRef.current.style.height = "auto";
      // Set the height to scrollHeight
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [message]);

  // Handle recording timer
  useEffect(() => {
    if (isVoiceRecording) {
      recordingTimerRef.current = window.setInterval(() => {
        setRecordingTime(prevTime => prevTime + 1);
      }, 1000);
    } else {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }
      setRecordingTime(0);
    }

    return () => {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
    };
  }, [isVoiceRecording]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatRecordingTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSendMessage = () => {
    const trimmedMessage = message.trim();
    if (trimmedMessage || attachment) {
      let content = trimmedMessage;
      
      // Add attachment info to message if present
      if (attachment) {
        content += `\n\n[${attachment.type === 'image' ? 'Image' : 
                          attachment.type === 'file' ? 'File' : 
                          'Voice Message'}: ${attachment.name}](${attachment.url})`;
      }
      
      onSendMessage(content);
      setMessage("");
      setAttachment(null);
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    
    // For a real app, we would upload the file and get a URL
    const fileUrl = URL.createObjectURL(file);
    
    if (file.type.startsWith('image/')) {
      setSelectedImage(fileUrl);
      setIsImageDialogOpen(true);
    } else {
      // Handle document files
      setAttachment({
        type: 'file',
        name: file.name,
        url: fileUrl,
        blob: file
      });
      
      toast({
        title: "File attached",
        description: `${file.name} ready to send`
      });
    }
    
    // Reset the file input so the same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleImageUpload = () => {
    if (!selectedImage) return;
    
    // Create a unique name for the image
    const timestamp = new Date().getTime();
    const randomSuffix = Math.floor(Math.random() * 1000);
    const mockImageName = `image_${timestamp}_${randomSuffix}.jpg`;
    
    setAttachment({
      type: 'image',
      name: mockImageName,
      url: selectedImage
    });
    
    setIsImageDialogOpen(false);
    setSelectedImage(null);
    
    toast({
      title: "Image attached",
      description: "Image ready to send"
    });
  };

  const handleStartVoiceRecording = () => {
    // In a real app, this would use the Web Audio API and MediaRecorder
    setIsVoiceRecording(true);
    
    toast({
      title: "Recording started",
      description: "Your voice is being recorded..."
    });
  };

  const handleStopVoiceRecording = () => {
    setIsVoiceRecording(false);
    
    // Create a mock voice message
    const duration = recordingTime;
    const timestamp = new Date().getTime();
    
    setAttachment({
      type: 'voice',
      name: `Voice Message (${formatRecordingTime(duration)})`,
      url: `https://example.com/voice_${timestamp}.mp3` // This would be a real URL in production
    });
    
    toast({
      title: "Recording complete",
      description: `Voice message (${formatRecordingTime(duration)}) ready to send`
    });
  };

  const handleFileUpload = (type: 'image' | 'file') => {
    if (fileInputRef.current) {
      if (type === 'image') {
        fileInputRef.current.accept = "image/*";
      } else {
        fileInputRef.current.accept = ".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt";
      }
      fileInputRef.current.click();
    }
  };

  return (
    <div className="px-4 py-3 border-t border-border/50 glass">
      {/* Hidden file input for real file selection */}
      <input 
        type="file" 
        ref={fileInputRef}
        style={{ display: 'none' }} 
        onChange={handleFileSelected}
      />
      
      {/* Voice Recording UI */}
      {isVoiceRecording && (
        <div className="mb-2 p-2 bg-accent/20 rounded-md flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse mr-2" />
            <span className="text-sm font-medium">Recording voice message: {formatRecordingTime(recordingTime)}</span>
          </div>
          <Button 
            variant="destructive" 
            size="sm" 
            className="h-8 w-8 rounded-full p-0"
            onClick={handleStopVoiceRecording}
          >
            <StopCircle className="h-5 w-5" />
          </Button>
        </div>
      )}
      
      {/* Attachment Preview */}
      {attachment && (
        <div className="mb-2 p-2 bg-muted/30 rounded-md flex items-center justify-between">
          <div className="flex items-center">
            {attachment.type === 'image' ? (
              <>
                <Image className="h-4 w-4 mr-2 text-primary" />
                <div className="flex items-center">
                  <img 
                    src={attachment.url} 
                    alt="Preview" 
                    className="h-8 w-8 object-cover rounded mr-2" 
                  />
                  <span className="text-sm truncate max-w-[150px] sm:max-w-xs">
                    {attachment.name}
                  </span>
                </div>
              </>
            ) : attachment.type === 'voice' ? (
              <>
                <Mic className="h-4 w-4 mr-2 text-primary" />
                <span className="text-sm truncate max-w-[150px] sm:max-w-xs">
                  {attachment.name}
                </span>
              </>
            ) : (
              <>
                <FileText className="h-4 w-4 mr-2 text-primary" />
                <span className="text-sm truncate max-w-[150px] sm:max-w-xs">
                  {attachment.name}
                </span>
              </>
            )}
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
            disabled={isVoiceRecording}
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
              <Button 
                variant="ghost" 
                size="icon" 
                className="rounded-full"
                disabled={isVoiceRecording}
              >
                <PaperclipIcon className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleFileUpload('image')}>
                <Image className="mr-2 h-4 w-4" />
                <span>Image</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleFileUpload('file')}>
                <FileText className="mr-2 h-4 w-4" />
                <span>Document</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button 
            variant={isVoiceRecording ? "destructive" : "ghost"} 
            size="icon" 
            className="rounded-full"
            onClick={isVoiceRecording ? handleStopVoiceRecording : handleStartVoiceRecording}
          >
            {isVoiceRecording ? (
              <StopCircle className="h-5 w-5" />
            ) : (
              <Mic className="h-5 w-5" />
            )}
          </Button>
          
          <Button 
            variant="default" 
            size="icon" 
            className="rounded-full"
            onClick={handleSendMessage}
            disabled={(!message.trim() && !attachment) || isVoiceRecording}
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Image Selection Dialog */}
      <Dialog open={isImageDialogOpen} onOpenChange={setIsImageDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Send Image</DialogTitle>
            <DialogDescription>
              Preview and send your selected image
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col space-y-4 py-4">
            {selectedImage ? (
              <div className="relative rounded-lg overflow-hidden">
                <img 
                  src={selectedImage}
                  alt="Selected"
                  className="w-full h-auto max-h-60 object-contain mx-auto"
                />
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="absolute top-2 right-2 bg-black/40 hover:bg-black/60"
                  onClick={() => setSelectedImage(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div 
                className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-12 text-center hover:border-muted-foreground/50 cursor-pointer"
                onClick={triggerFileInput}
              >
                <div className="flex flex-col items-center">
                  <Image className="h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Click to select an image
                  </p>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsImageDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleImageUpload} disabled={!selectedImage}>
              <Image className="mr-2 h-4 w-4" />
              Send Image
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
