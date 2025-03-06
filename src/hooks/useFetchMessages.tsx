
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ChatMessage } from "@/types/message.types";
import { useAuth } from "@/context/auth-context";

// Default avatar options for AIs
const DEFAULT_AI_AVATARS = {
  "ChatGPT": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/ChatGPT_logo.svg/1200px-ChatGPT_logo.svg.png",
  "Claude": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/10/Claude_logo.svg/1200px-Claude_logo.svg.png",
  "Gemini": "https://lh3.googleusercontent.com/v0v5xzCQmF7lJMJQZd37HkKkfI6771h7jYoBQ4UHx-3E9T6XJV98ZZzOuW8L3uHMPjPdZyYzAtqrGGHf_DTxDLr3cA=w128-h128-e365-rj-sc0x00ffffff",
  "Perplexity": "https://assets-global.website-files.com/64f6a907571f1515fb0435f2/65118ffc76c5658e3cfcca21_perplexity-logo-symbol-black.png",
  "DeepSeek": "https://avatars.githubusercontent.com/u/140274974",
  "Llama": "https://seeklogo.com/images/L/llama-2-logo-21E8AF4D49-seeklogo.com.png",
  "Mistral": "https://avatars.githubusercontent.com/u/99472513",
  "Copilot": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/69/GitHub_Copilot_logo.svg/1200px-GitHub_Copilot_logo.svg.png"
};

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
        let query;
        
        if (isAi) {
          // For AI chats, get messages between the user and this specific AI
          query = supabase
            .from('messages')
            .select('*')
            .or(`sender_id.eq.${chatId},and(receiver_id.eq.${chatId},sender_id.eq.${user.id})`)
            .order('timestamp', { ascending: true });
        } else {
          // For regular chats, get messages between the two users
          query = supabase
            .from('messages')
            .select('*')
            .or(`and(sender_id.eq.${user.id},receiver_id.eq.${chatId}),and(sender_id.eq.${chatId},receiver_id.eq.${user.id})`)
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
            } else if (isAi) {
              // For AI messages, use the AI name and avatar
              const aiName = Object.keys(DEFAULT_AI_AVATARS).find(name => 
                msg.sender_id.toLowerCase().includes(name.toLowerCase())
              );
              
              if (aiName) {
                senderName = aiName;
                senderAvatar = DEFAULT_AI_AVATARS[aiName];
              } else {
                // Use the ID as name if no match
                senderName = msg.sender_id;
                senderAvatar = "https://avatars.githubusercontent.com/u/124071931"; // Generic AI avatar
              }
            } else {
              // Fetch sender info from profiles for human senders
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
              chatId: isAi ? chatId : msg.receiver_id,
              senderId: msg.sender_id,
              senderName: senderName,
              senderAvatar: senderAvatar || DEFAULT_AI_AVATARS[senderName] || "https://avatars.githubusercontent.com/u/124071931",
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
