
import { useState } from "react";
import { useAuth } from "@/context/auth-context";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { FriendRequest } from "@/context/auth-context";
import { Check, X, Loader2, Mail, MailCheck, MailX, Clock } from "lucide-react";

interface FriendRequestItemProps {
  request: FriendRequest;
  contactName: string;
  contactAvatar?: string;
  isSentByUser: boolean;
}

export default function FriendRequestItem({ 
  request, 
  contactName, 
  contactAvatar, 
  isSentByUser 
}: FriendRequestItemProps) {
  const { acceptFriendRequest, rejectFriendRequest } = useAuth();
  const { toast } = useToast();
  const [isAccepting, setIsAccepting] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);

  const handleAccept = async () => {
    try {
      setIsAccepting(true);
      await acceptFriendRequest(request.id);
      toast({
        title: "Friend request accepted",
        description: `${contactName} has been added to your contacts`,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to accept request";
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
      });
    } finally {
      setIsAccepting(false);
    }
  };

  const handleReject = async () => {
    try {
      setIsRejecting(true);
      await rejectFriendRequest(request.id);
      toast({
        title: "Friend request rejected",
        description: `Friend request from ${contactName} has been rejected`,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to reject request";
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
      });
    } finally {
      setIsRejecting(false);
    }
  };

  // Render different content based on request status and direction
  if (request.status === 'pending') {
    if (isSentByUser) {
      // Request sent by user, waiting for response
      return (
        <div className="flex items-center justify-between p-3 bg-muted/30 rounded-md">
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9">
              <AvatarImage src={contactAvatar} alt={contactName} />
              <AvatarFallback>{contactName[0]}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium">{contactName}</p>
              <div className="flex items-center text-xs text-muted-foreground">
                <Clock className="h-3 w-3 mr-1" />
                Request pending
              </div>
            </div>
          </div>
          <div className="flex-shrink-0 bg-primary/10 text-primary text-xs px-2 py-1 rounded-full flex items-center">
            <Mail className="h-3 w-3 mr-1" />
            Sent
          </div>
        </div>
      );
    } else {
      // Request received by user, needs action
      return (
        <div className="flex items-center justify-between p-3 bg-muted/30 rounded-md">
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9">
              <AvatarImage src={contactAvatar} alt={contactName} />
              <AvatarFallback>{contactName[0]}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium">{contactName}</p>
              <p className="text-xs text-muted-foreground">Wants to add you as a friend</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={handleAccept} disabled={isAccepting || isRejecting}>
              {isAccepting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Check className="h-4 w-4 mr-1" />
                  Accept
                </>
              )}
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={handleReject} 
              disabled={isAccepting || isRejecting}
            >
              {isRejecting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <X className="h-4 w-4 mr-1" />
                  Reject
                </>
              )}
            </Button>
          </div>
        </div>
      );
    }
  } else if (request.status === 'accepted') {
    // Accepted request
    return (
      <div className="flex items-center justify-between p-3 bg-muted/30 rounded-md">
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9">
            <AvatarImage src={contactAvatar} alt={contactName} />
            <AvatarFallback>{contactName[0]}</AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium">{contactName}</p>
            <div className="flex items-center text-xs text-green-600">
              <MailCheck className="h-3 w-3 mr-1" />
              Request accepted
            </div>
          </div>
        </div>
        <div className="flex-shrink-0 bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 text-xs px-2 py-1 rounded-full">
          Friends
        </div>
      </div>
    );
  } else {
    // Rejected request
    return (
      <div className="flex items-center justify-between p-3 bg-muted/30 rounded-md">
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9">
            <AvatarImage src={contactAvatar} alt={contactName} />
            <AvatarFallback>{contactName[0]}</AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium">{contactName}</p>
            <div className="flex items-center text-xs text-red-600">
              <MailX className="h-3 w-3 mr-1" />
              Request rejected
            </div>
          </div>
        </div>
        <div className="flex-shrink-0 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs px-2 py-1 rounded-full">
          Rejected
        </div>
      </div>
    );
  }
}
