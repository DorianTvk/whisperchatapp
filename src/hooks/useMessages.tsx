import { useState, useEffect } from "react";
import { useToast } from "./use-toast";
import { useAuth } from "@/context/auth-context";
import { supabase } from "@/integrations/supabase/client";

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

export const useMessages = (chatId: string, isAi: boolean = false) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load messages from Supabase
  useEffect(() => {
    if (!chatId || !user) {
      setIsLoading(false);
      return;
    }
    
    const fetchMessages = async () => {
      try {
        let query = supabase
          .from('messages')
          .select('*')
          .or(`and(sender_id.eq.${user.id},receiver_id.eq.${chatId}),and(sender_id.eq.${chatId},receiver_id.eq.${user.id})`)
          .order('timestamp', { ascending: true });
        
        if (isAi) {
          // For AI chats, only get messages where receiver_id is the AI and is_ai_chat is true
          query = supabase
            .from('messages')
            .select('*')
            .eq('sender_id', user.id)
            .eq('receiver_id', chatId)
            .eq('is_ai_chat', true)
            .order('timestamp', { ascending: true });
        }

        const { data, error } = await query;
        
        if (error) {
          console.error('Error fetching messages:', error);
          return;
        }
        
        if (data) {
          // Format messages
          const formattedMessages: ChatMessage[] = await Promise.all(data.map(async (msg) => {
            // For messages sent by other users, fetch their profile info
            let senderName = '';
            let senderAvatar = '';
            
            if (msg.sender_id === user.id) {
              senderName = user.username;
              senderAvatar = user.avatar;
            } else {
              // Fetch sender info from profiles
              const { data: senderData } = await supabase
                .from('profiles')
                .select('username, avatar')
                .eq('id', msg.sender_id)
                .single();
              
              if (senderData) {
                senderName = senderData.username;
                senderAvatar = senderData.avatar;
              }
            }
            
            return {
              id: msg.id,
              chatId: msg.receiver_id,
              senderId: msg.sender_id,
              senderName: senderName,
              senderAvatar: senderAvatar,
              content: msg.content,
              timestamp: msg.timestamp,
              isRead: msg.is_read,
              isOwnMessage: msg.sender_id === user.id
            };
          }));
          
          setMessages(formattedMessages);
        }
      } catch (error) {
        console.error('Error in message fetch:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchMessages();
    
    // Subscribe to new messages
    const subscription = supabase
      .channel(`messages:${chatId}`)
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'messages',
        filter: isAi 
          ? `sender_id=eq.${user.id} AND receiver_id=eq.${chatId} AND is_ai_chat=eq.true`
          : `(sender_id=eq.${user.id} AND receiver_id=eq.${chatId}) OR (sender_id=eq.${chatId} AND receiver_id=eq.${user.id})`
      }, async (payload) => {
        const newMsg = payload.new;
        
        // Get sender info if not the current user
        let senderName = '';
        let senderAvatar = '';
        
        if (newMsg.sender_id === user.id) {
          senderName = user.username;
          senderAvatar = user.avatar;
        } else {
          // Fetch sender info from profiles
          const { data: senderData } = await supabase
            .from('profiles')
            .select('username, avatar')
            .eq('id', newMsg.sender_id)
            .single();
          
          if (senderData) {
            senderName = senderData.username;
            senderAvatar = senderData.avatar;
          }
        }
        
        const formattedMsg: ChatMessage = {
          id: newMsg.id,
          chatId: newMsg.receiver_id,
          senderId: newMsg.sender_id,
          senderName: senderName,
          senderAvatar: senderAvatar,
          content: newMsg.content,
          timestamp: newMsg.timestamp,
          isRead: newMsg.is_read,
          isOwnMessage: newMsg.sender_id === user.id
        };
        
        setMessages(prev => [...prev, formattedMsg]);
      })
      .subscribe();
    
    return () => {
      subscription.unsubscribe();
    };
  }, [chatId, user, isAi]);

  // Send a message (for user-sent messages)
  const sendMessage = async (content: string, replyToMessage?: ChatMessage, mockMessage?: ChatMessage) => {
    if (!chatId || !content.trim() || !user) return null;
    
    // If this is a mock message (for AI responses), use it directly
    if (mockMessage) {
      // Send AI response to database
      const { data, error } = await supabase
        .from('messages')
        .insert({
          sender_id: chatId, // The AI is the sender
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
    }
    
    // Otherwise create a new user message
    try {
      // Create message object
      const messageData = {
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
      if (!user) return;
      
      const { error } = await supabase
        .from('messages')
        .delete()
        .eq('id', messageId)
        .eq('sender_id', user.id);
      
      if (error) {
        throw error;
      }
      
      // Update messages in state
      const updatedMessages = messages.filter(msg => msg.id !== messageId);
      setMessages(updatedMessages);
      
      toast({
        title: "Message deleted",
        description: "The message has been deleted"
      });
    } catch (error) {
      console.error('Error deleting message:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete message"
      });
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
        // For AI chats, only delete messages where receiver_id is the AI and is_ai_chat is true
        query = query
          .eq('sender_id', user.id)
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
      
      // Clear messages in state
      setMessages([]);
      
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
    messages,
    isLoading,
    sendMessage,
    deleteMessage,
    deleteChat
  };
};
