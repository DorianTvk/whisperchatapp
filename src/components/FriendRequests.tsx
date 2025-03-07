
import { useAuth } from "@/context/auth-context";
import { ScrollArea } from "@/components/ui/scroll-area";
import FriendRequestItem from "./FriendRequestItem";
import { Mail } from "lucide-react";

export default function FriendRequests() {
  const { friendRequests, contacts, user } = useAuth();

  // Get received pending requests
  const receivedRequests = friendRequests.filter(
    req => req.receiverId === user?.id && req.status === 'pending'
  );

  // Get sent pending requests
  const sentRequests = friendRequests.filter(
    req => req.senderId === user?.id && req.status === 'pending'
  );

  // Find contact name by ID
  const getContactInfo = (userId: string) => {
    const contact = contacts.find(c => c.id === userId);
    return {
      name: contact?.name || "Unknown User",
      avatar: contact?.avatar
    };
  };

  // If no requests, show a message
  if (receivedRequests.length === 0 && sentRequests.length === 0) {
    return (
      <div className="py-4 text-center text-muted-foreground">
        <Mail className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p>No friend requests</p>
      </div>
    );
  }

  return (
    <ScrollArea className="max-h-[400px] pr-4">
      <div className="space-y-4">
        {receivedRequests.length > 0 && (
          <div>
            <h3 className="font-medium text-sm mb-2">Received Requests</h3>
            <div className="space-y-2">
              {receivedRequests.map(request => {
                const { name, avatar } = getContactInfo(request.senderId);
                return (
                  <FriendRequestItem 
                    key={request.id}
                    request={request} 
                    contactName={name}
                    contactAvatar={avatar} 
                    isSentByUser={false}
                  />
                );
              })}
            </div>
          </div>
        )}

        {sentRequests.length > 0 && (
          <div className={receivedRequests.length > 0 ? "mt-4" : ""}>
            <h3 className="font-medium text-sm mb-2">Sent Requests</h3>
            <div className="space-y-2">
              {sentRequests.map(request => {
                const { name, avatar } = getContactInfo(request.receiverId);
                return (
                  <FriendRequestItem 
                    key={request.id}
                    request={request} 
                    contactName={name}
                    contactAvatar={avatar} 
                    isSentByUser={true}
                  />
                );
              })}
            </div>
          </div>
        )}
      </div>
    </ScrollArea>
  );
}
