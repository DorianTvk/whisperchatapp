import { useState, useEffect } from "react";
import { useToast } from "./use-toast";
import { useAuth } from "@/context/auth-context";

export interface ChatMessage {
  id: string;
  chatId: string; // can be userId for direct messages or groupId for group chats
  senderId: string;
  senderName: string;
  senderAvatar: string;
  content: string;
  timestamp: string;
  isRead: boolean;
  isOwnMessage?: boolean;
  replyTo?: {
    id: string;
    senderName: string;
    content: string;
  };
}

// Chat storage keys
const DIRECT_MESSAGES_KEY = "whisper-direct-messages";
const GROUP_MESSAGES_KEY = "whisper-group-messages";
const AI_MESSAGES_KEY = "whisper-ai-messages";

export const useMessages = (chatId: string, isAi: boolean = false) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load messages
  useEffect(() => {
    if (!chatId) return;
    
    const storageKey = isAi ? AI_MESSAGES_KEY : DIRECT_MESSAGES_KEY;
    const storedMessages = localStorage.getItem(storageKey);
    
    if (storedMessages) {
      try {
        const parsedMessages = JSON.parse(storedMessages) as Record<string, ChatMessage[]>;
        setMessages(parsedMessages[chatId] || []);
      } catch (error) {
        console.error("Failed to parse messages:", error);
        setMessages([]);
      }
    }
    
    setIsLoading(false);
  }, [chatId, isAi]);

  // Send a message (for user-sent messages)
  const sendMessage = async (content: string, replyToMessage?: ChatMessage, mockMessage?: ChatMessage) => {
    if (!chatId || !content.trim()) return null;
    
    // If this is a mock message (for AI responses), use it directly
    if (mockMessage) {
      const updatedMessages = [...messages, mockMessage];
      setMessages(updatedMessages);
      
      // Save to storage
      saveMessagesToStorage(updatedMessages);
      return mockMessage;
    }
    
    // Otherwise create a new user message
    if (!user) return null;
    
    // Create new message
    const newMessage: ChatMessage = {
      id: `msg_${Date.now()}`,
      chatId,
      senderId: user.id,
      senderName: user.username,
      senderAvatar: user.avatar,
      content: content.trim(),
      timestamp: new Date().toISOString(),
      isRead: false,
      isOwnMessage: true
    };
    
    // Add reply information if replying to a message
    if (replyToMessage) {
      newMessage.replyTo = {
        id: replyToMessage.id,
        senderName: replyToMessage.senderName,
        content: replyToMessage.content
      };
    }
    
    // Update messages in state
    const updatedMessages = [...messages, newMessage];
    setMessages(updatedMessages);
    
    // Save to storage
    saveMessagesToStorage(updatedMessages);
    
    return newMessage;
  };

  // Save messages to local storage
  const saveMessagesToStorage = (messagesToSave: ChatMessage[]) => {
    const storageKey = isAi ? AI_MESSAGES_KEY : DIRECT_MESSAGES_KEY;
    const storedMessages = localStorage.getItem(storageKey);
    let allMessages: Record<string, ChatMessage[]> = {};
    
    if (storedMessages) {
      try {
        allMessages = JSON.parse(storedMessages);
      } catch (error) {
        console.error("Failed to parse stored messages:", error);
      }
    }
    
    allMessages[chatId] = messagesToSave;
    localStorage.setItem(storageKey, JSON.stringify(allMessages));
  };

  // Delete a message
  const deleteMessage = async (messageId: string) => {
    // Update messages in state
    const updatedMessages = messages.filter(msg => msg.id !== messageId);
    setMessages(updatedMessages);
    
    // Update messages in storage
    saveMessagesToStorage(updatedMessages);
    
    toast({
      title: "Message deleted",
      description: "The message has been deleted"
    });
  };

  // Delete entire chat
  const deleteChat = async () => {
    // Delete all messages for this chat
    const storageKey = isAi ? AI_MESSAGES_KEY : DIRECT_MESSAGES_KEY;
    const storedMessages = localStorage.getItem(storageKey);
    
    if (storedMessages) {
      try {
        const allMessages = JSON.parse(storedMessages) as Record<string, ChatMessage[]>;
        delete allMessages[chatId];
        localStorage.setItem(storageKey, JSON.stringify(allMessages));
        
        // Clear messages in state
        setMessages([]);
        
        toast({
          title: "Chat deleted",
          description: "The conversation has been deleted"
        });
        
        return true;
      } catch (error) {
        console.error("Failed to delete chat:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to delete chat"
        });
        return false;
      }
    }
    
    return true; // If no messages existed, consider it a success
  };

  return {
    messages,
    isLoading,
    sendMessage,
    deleteMessage,
    deleteChat
  };
};
