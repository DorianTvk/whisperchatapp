
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
}

// Chat storage keys
const DIRECT_MESSAGES_KEY = "whisper-direct-messages";
const GROUP_MESSAGES_KEY = "whisper-group-messages";

export const useMessages = (chatId: string, isGroup: boolean = false) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load messages
  useEffect(() => {
    if (!chatId) return;
    
    const storageKey = isGroup ? GROUP_MESSAGES_KEY : DIRECT_MESSAGES_KEY;
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
  }, [chatId, isGroup]);

  // Send a message
  const sendMessage = async (content: string) => {
    if (!user || !chatId || !content.trim()) return null;
    
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
    
    // Update messages in state
    const updatedMessages = [...messages, newMessage];
    setMessages(updatedMessages);
    
    // Update messages in storage
    const storageKey = isGroup ? GROUP_MESSAGES_KEY : DIRECT_MESSAGES_KEY;
    const storedMessages = localStorage.getItem(storageKey);
    let allMessages: Record<string, ChatMessage[]> = {};
    
    if (storedMessages) {
      try {
        allMessages = JSON.parse(storedMessages);
      } catch (error) {
        console.error("Failed to parse stored messages:", error);
      }
    }
    
    allMessages[chatId] = updatedMessages;
    localStorage.setItem(storageKey, JSON.stringify(allMessages));
    
    return newMessage;
  };

  // Delete a message
  const deleteMessage = async (messageId: string) => {
    // Update messages in state
    const updatedMessages = messages.filter(msg => msg.id !== messageId);
    setMessages(updatedMessages);
    
    // Update messages in storage
    const storageKey = isGroup ? GROUP_MESSAGES_KEY : DIRECT_MESSAGES_KEY;
    const storedMessages = localStorage.getItem(storageKey);
    
    if (storedMessages) {
      try {
        const allMessages = JSON.parse(storedMessages) as Record<string, ChatMessage[]>;
        allMessages[chatId] = updatedMessages;
        localStorage.setItem(storageKey, JSON.stringify(allMessages));
        
        toast({
          title: "Message deleted",
          description: "The message has been deleted"
        });
      } catch (error) {
        console.error("Failed to delete message:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to delete message"
        });
      }
    }
  };

  // Delete entire chat
  const deleteChat = async () => {
    // Delete all messages for this chat
    const storageKey = isGroup ? GROUP_MESSAGES_KEY : DIRECT_MESSAGES_KEY;
    const storedMessages = localStorage.getItem(storageKey);
    
    if (storedMessages) {
      try {
        const allMessages = JSON.parse(storedMessages) as Record<string, ChatMessage[]>;
        delete allMessages[chatId];
        localStorage.setItem(storageKey, JSON.stringify(allMessages));
        
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
