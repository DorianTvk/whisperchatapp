
import { useState } from "react";
import { ChatMessage } from "@/types/message.types";
import { useFetchMessages } from "./useFetchMessages";
import { useMessageSubscription } from "./useMessageSubscription";
import { useMessageActions } from "./useMessageActions";

// Use 'export type' syntax for re-exporting types with isolatedModules
export type { ChatMessage } from "@/types/message.types";

export const useMessages = (chatId: string, isAi: boolean = false) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  
  // Fetch initial messages
  const { messages: initialMessages, isLoading } = useFetchMessages(chatId, isAi);
  
  // Set messages once they're loaded
  if (messages.length === 0 && initialMessages.length > 0) {
    setMessages(initialMessages);
  }
  
  // Subscribe to new messages
  useMessageSubscription(chatId, isAi, (newMessage) => {
    setMessages(prev => [...prev, newMessage]);
  });
  
  // Message actions
  const { sendMessage, deleteMessage, deleteChat } = useMessageActions(chatId, isAi);
  
  // Handle deleting a message from the UI
  const handleDeleteMessage = async (messageId: string) => {
    const success = await deleteMessage(messageId);
    if (success) {
      // Update messages in UI
      setMessages(prev => prev.filter(msg => msg.id !== messageId));
    }
    return success;
  };

  return {
    messages,
    isLoading,
    sendMessage: async (content: string, replyToMessage?: ChatMessage, mockMessage?: ChatMessage) => {
      const newMessage = await sendMessage(content, replyToMessage, mockMessage);
      if (newMessage && !mockMessage) {
        // Only add the message to the UI if it's not a mock message (since mock messages come back through subscription)
        setMessages(prev => [...prev, newMessage]);
      }
      return newMessage;
    },
    deleteMessage: handleDeleteMessage,
    deleteChat: async () => {
      const success = await deleteChat();
      if (success) {
        setMessages([]);
      }
      return success;
    }
  };
};
