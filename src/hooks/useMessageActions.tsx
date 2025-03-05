import { useAuth } from "@/context/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { ChatMessage } from "@/types/message.types";
import { useToast } from "./use-toast";
import { v4 as uuidv4 } from "uuid";

export const useMessageActions = (chatId: string, isAi: boolean = false) => {
  const { user } = useAuth();
  const { toast } = useToast();

  // Generate a proper UUID for mock AI messages
  const generateProperAiId = () => {
    // If this is a real UUID already, return it
    if (chatId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
      return chatId;
    }
    // Otherwise generate a proper UUID
    return uuidv4();
  };

  // Send a message
  const sendMessage = async (content: string, replyToMessage?: ChatMessage, mockMessage?: ChatMessage) => {
    if (!chatId || !content.trim() || !user) return null;
    
    // If this is a mock message (for AI responses), use it directly
    if (mockMessage) {
      // Generate a proper AI ID for database compatibility
      const aiId = generateProperAiId();
      
      // Send AI response to database
      try {
        const { data, error } = await supabase
          .from('messages')
          .insert({
            sender_id: aiId, // The AI is the sender with a proper UUID
            receiver_id: user.id,
            content: mockMessage.content,
            is_ai_chat: true,
            is_read: true
          })
          .select()
          .single();
        
        if (error) {
          console.error('Error saving AI message:', error);
          return null;
        }
        
        return {
          ...mockMessage,
          id: data.id,
          timestamp: data.timestamp
        };
      } catch (error) {
        console.error('Error in AI message save:', error);
        return null;
      }
    }
    
    // Otherwise create a new user message
    try {
      // Create message object
      const messageData: any = {
        sender_id: user.id,
        receiver_id: chatId,
        content: content.trim(),
        is_ai_chat: isAi,
        is_read: false
      };
      
      // Add reply information if replying to a message
      if (replyToMessage) {
        messageData.reply_to_id = replyToMessage.id;
      }
      
      // Insert message into database
      const { data, error } = await supabase
        .from('messages')
        .insert(messageData)
        .select()
        .single();
      
      if (error) {
        console.error('Error sending message:', error);
        return null;
      }
      
      // Format the message for UI
      const newMessage: ChatMessage = {
        id: data.id,
        chatId,
        senderId: user.id,
        senderName: user.username,
        senderAvatar: user.avatar,
        content: content.trim(),
        timestamp: data.timestamp,
        isRead: false,
        isOwnMessage: true
      };
      
      // If replying to a message, add reply info
      if (replyToMessage) {
        newMessage.replyTo = {
          id: replyToMessage.id,
          senderName: replyToMessage.senderName,
          content: replyToMessage.content
        };
      }
      
      return newMessage;
    } catch (error) {
      console.error('Error in sending message:', error);
      return null;
    }
  };

  // Delete a message
  const deleteMessage = async (messageId: string) => {
    try {
      if (!user) return false;
      
      const { error } = await supabase
        .from('messages')
        .delete()
        .eq('id', messageId)
        .eq('sender_id', user.id);
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Message deleted",
        description: "The message has been deleted"
      });
      
      return true;
    } catch (error) {
      console.error('Error deleting message:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete message"
      });
      return false;
    }
  };

  // Delete entire chat
  const deleteChat = async () => {
    try {
      if (!user || !chatId) return false;
      
      let query = supabase
        .from('messages')
        .delete();
      
      if (isAi) {
        // For AI chats, delete messages where the AI is involved and is_ai_chat is true
        query = query
          .eq('receiver_id', chatId)
          .eq('is_ai_chat', true);
      } else {
        // For direct chats, delete messages between the two users
        query = query.or(`and(sender_id.eq.${user.id},receiver_id.eq.${chatId}),and(sender_id.eq.${chatId},receiver_id.eq.${user.id})`);
      }
      
      const { error } = await query;
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Chat deleted",
        description: "The conversation has been deleted"
      });
      
      return true;
    } catch (error) {
      console.error('Error deleting chat:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete chat"
      });
      return false;
    }
  };

  return {
    sendMessage,
    deleteMessage,
    deleteChat
  };
};
