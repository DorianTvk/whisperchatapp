
import { useState, useEffect, useCallback, useMemo } from "react";
import { ChatMessage } from "@/types/message.types";
import { useFetchMessages } from "./useFetchMessages";
import { useMessageSubscription } from "./useMessageSubscription";
import { useMessageActions } from "./useMessageActions";
import { v4 as uuidv4 } from "uuid";

// Use 'export type' syntax for re-exporting types with isolatedModules
export type { ChatMessage } from "@/types/message.types";

export const useMessages = (chatId: string, isAi: boolean = false) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  
  // Create a proper UUID for AI if necessary - memoized to prevent recalculations
  const properAiId = useMemo(() => {
    return chatId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i) 
      ? chatId 
      : uuidv4();
  }, [chatId]);
  
  // Fetch initial messages
  const { messages: initialMessages, isLoading } = useFetchMessages(
    isAi ? properAiId : chatId, 
    isAi
  );
  
  // Set messages once they're loaded - with useEffect for better control
  useEffect(() => {
    if (initialMessages.length > 0 && messages.length === 0) {
      setMessages(initialMessages);
    }
  }, [initialMessages, messages.length]);
  
  // Subscribe to new messages - memoized callback to prevent unnecessary resubscriptions
  useMessageSubscription(
    isAi ? properAiId : chatId, 
    isAi, 
    useCallback((newMessage) => {
      setMessages(prev => [...prev, newMessage]);
    }, [])
  );
  
  // Message actions
  const { sendMessage, deleteMessage, deleteChat } = useMessageActions(
    isAi ? properAiId : chatId, 
    isAi
  );
  
  // Handle deleting a message from the UI - memoized to prevent function recreations
  const handleDeleteMessage = useCallback(async (messageId: string) => {
    const success = await deleteMessage(messageId);
    if (success) {
      // Update messages in UI
      setMessages(prev => prev.filter(msg => msg.id !== messageId));
    }
    return success;
  }, [deleteMessage]);

  // Memoize the sendMessage wrapper to prevent unnecessary recreations
  const handleSendMessage = useCallback(async (content: string, replyToMessage?: ChatMessage, mockMessage?: ChatMessage) => {
    const newMessage = await sendMessage(content, replyToMessage, mockMessage);
    if (newMessage && !mockMessage) {
      // Only add the message to the UI if it's not a mock message (since mock messages come back through subscription)
      setMessages(prev => [...prev, newMessage]);
    }
    return newMessage;
  }, [sendMessage]);

  // Memoize the deleteChat wrapper
  const handleDeleteChat = useCallback(async () => {
    const success = await deleteChat();
    if (success) {
      setMessages([]);
    }
    return success;
  }, [deleteChat]);

  return {
    messages,
    isLoading,
    sendMessage: handleSendMessage,
    deleteMessage: handleDeleteMessage,
    deleteChat: handleDeleteChat
  };
};
