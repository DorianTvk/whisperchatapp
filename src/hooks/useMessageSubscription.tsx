
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ChatMessage } from "@/types/message.types";
import { useAuth } from "@/context/auth-context";

// Default avatar options for AIs in case they're missing
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

export const useMessageSubscription = (
  chatId: string, 
  isAi: boolean = false,
  onNewMessage: (message: ChatMessage) => void
) => {
  const { user } = useAuth();

  useEffect(() => {
    if (!chatId || !user) return;
    
    // For AI chats, build a filter based on the AI's ID or name
    const filter = isAi 
      ? `sender_id=eq.${chatId} OR (receiver_id=eq.${chatId} AND sender_id=eq.${user.id})`
      : `(sender_id=eq.${user.id} AND receiver_id=eq.${chatId}) OR (sender_id=eq.${chatId} AND receiver_id=eq.${user.id})`;
    
    // Subscribe to new messages
    const subscription = supabase
      .channel(`messages:${chatId}`)
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'messages',
        filter: filter
      }, async (payload) => {
        const newMsg = payload.new;
        
        // Get sender info if not the current user
        let senderName = '';
        let senderAvatar = '';
        
        if (newMsg.sender_id === user.id) {
          senderName = user.username;
          senderAvatar = user.avatar;
        } else {
          // Check if this is an AI message by matching the sender_id with common AI names
          if (isAi) {
            // Find the AI name from the list of defaults
            const aiName = Object.keys(DEFAULT_AI_AVATARS).find(name => 
              newMsg.sender_id.toLowerCase().includes(name.toLowerCase())
            );
            
            if (aiName) {
              senderName = aiName;
              senderAvatar = DEFAULT_AI_AVATARS[aiName];
            } else {
              // Use the ID as name if no match (fallback)
              senderName = newMsg.sender_id;
              senderAvatar = "https://avatars.githubusercontent.com/u/124071931"; // Generic AI avatar
            }
          } else {
            // Fetch sender info from profiles for non-AI senders
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
        }
        
        const formattedMsg: ChatMessage = {
          id: newMsg.id,
          chatId: isAi ? chatId : newMsg.receiver_id,
          senderId: newMsg.sender_id,
          senderName: senderName,
          senderAvatar: senderAvatar || DEFAULT_AI_AVATARS[senderName] || "https://avatars.githubusercontent.com/u/124071931",
          content: newMsg.content,
          timestamp: newMsg.timestamp,
          isRead: newMsg.is_read,
          isOwnMessage: newMsg.sender_id === user.id
        };
        
        onNewMessage(formattedMsg);
      })
      .subscribe();
    
    return () => {
      subscription.unsubscribe();
    };
  }, [chatId, user, isAi, onNewMessage]);
};
