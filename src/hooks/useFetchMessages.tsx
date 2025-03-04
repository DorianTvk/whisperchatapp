
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ChatMessage } from "@/types/message.types";
import { useAuth } from "@/context/auth-context";

export const useFetchMessages = (chatId: string, isAi: boolean = false) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
    
    return () => {
      // Cleanup function
    };
  }, [chatId, user, isAi]);

  return {
    messages,
    isLoading
  };
};
