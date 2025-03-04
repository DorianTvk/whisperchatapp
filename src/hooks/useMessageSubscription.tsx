
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ChatMessage } from "@/types/message.types";
import { useAuth } from "@/context/auth-context";

export const useMessageSubscription = (
  chatId: string, 
  isAi: boolean = false,
  onNewMessage: (message: ChatMessage) => void
) => {
  const { user } = useAuth();

  useEffect(() => {
    if (!chatId || !user) return;
    
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
        
        onNewMessage(formattedMsg);
      })
      .subscribe();
    
    return () => {
      subscription.unsubscribe();
    };
  }, [chatId, user, isAi, onNewMessage]);
};
