
import { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuPortal
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import ChatSidebar from "@/components/ChatSidebar";
import MessageInput from "@/components/MessageInput";
import ChatMessage from "@/components/ChatMessage";
import { useAuth } from "@/context/auth-context";
import { useMessages, ChatMessage as MessageType } from "@/hooks/useMessages";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, MoreVertical, Phone, Video, Search, Users, Trash, Bell, BellOff, UserPlus, Info } from "lucide-react";

export default function GroupChat() {
  const { groupId } = useParams<{ groupId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, contacts, groups, addToGroup, leaveGroup } = useAuth();
  
  const { messages, isLoading, sendMessage, deleteMessage, deleteChat } = useMessages(groupId || "", true);
  const [replyTo, setReplyTo] = useState<MessageType | null>(null);
  const [showMembers, setShowMembers] = useState(false);
  const [showLeaveAlert, setShowLeaveAlert] = useState(false);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  
  const group = groups.find(g => g.id === groupId);
  const isAdmin = group?.createdBy === user?.id;
  
  // Get group members info
  const memberDetails = contacts.filter(contact => 
    group?.members.includes(contact.id)
  );
  
  // Get contacts not in the group for adding
  const availableContacts = contacts.filter(contact => 
    !group?.members.includes(contact.id)
  );

  useEffect(() => {
    if (!group) {
      navigate("/dashboard");
      return;
    }
  }, [groupId, navigate, group]);

  useEffect(() => {
    // Scroll to bottom when messages change
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages]);

  const handleSendMessage = async (content: string) => {
    if (!user) return;
    
    await sendMessage(content);
    setReplyTo(null);
  };

  const handleReply = (message: MessageType) => {
    setReplyTo(message);
  };

  const handleLeaveGroup = async () => {
    if (!groupId) return;
    
    try {
      await leaveGroup(groupId);
      toast({
        title: isAdmin ? "Group deleted" : "Left group",
        description: isAdmin 
          ? "The group has been deleted" 
          : "You have left the group"
      });
      navigate("/dashboard");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to leave group"
      });
    }
  };

  const handleDeleteChat = async () => {
    const success = await deleteChat();
    if (success) {
      setShowDeleteAlert(false);
      toast({
        title: "Chat history cleared",
        description: "All messages have been deleted"
      });
    }
  };

  const handleAddMember = async (contactId: string) => {
    if (!groupId) return;
    
    try {
      await addToGroup(groupId, contactId);
      toast({
        title: "Member added",
        description: "New member has been added to the group"
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add member"
      });
    }
  };

  if (!group || !user) return null;

  return (
    <div className="flex h-screen bg-background/50">
      {/* Sidebar */}
      <div className="w-72 hidden md:block">
        <ChatSidebar />
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Chat Header */}
        <header className="px-4 py-3 border-b border-border/50 glass flex items-center justify-between">
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              size="icon" 
              className="mr-2 md:hidden" 
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            
            <div className="flex items-center">
              <Avatar className="h-9 w-9">
                <AvatarImage src={group.avatar} alt={group.name} />
                <AvatarFallback>{group.name.charAt(0)}</AvatarFallback>
              </Avatar>
              
              <div className="ml-3">
                <h2 className="font-medium text-sm">{group.name}</h2>
                <p className="text-xs text-muted-foreground">
                  {group.members.length} members
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-1">
            <Button variant="ghost" size="icon" className="rounded-full">
              <Search className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Phone className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Video className="h-4 w-4" />
            </Button>
            
            <Sheet open={showMembers} onOpenChange={setShowMembers}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Users className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Group Members</SheetTitle>
                </SheetHeader>
                <div className="py-4">
                  <div className="text-sm text-muted-foreground mb-4">
                    {memberDetails.length} members
                  </div>
                  <ScrollArea className="h-[calc(100vh-180px)]">
                    <div className="space-y-4">
                      {memberDetails.map((member) => (
                        <div key={member.id} className="flex items-center justify-between">
                          <div className="flex items-center">
                            <Avatar className="h-8 w-8 mr-3">
                              <AvatarImage src={member.avatar} alt={member.name} />
                              <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <h4 className="text-sm font-medium">
                                {member.name}
                                {member.id === user.id && " (You)"}
                                {member.id === group.createdBy && 
                                  <span className="ml-1 text-xs text-muted-foreground">(Admin)</span>
                                }
                              </h4>
                              <p className="text-xs text-muted-foreground capitalize">
                                {member.status}
                              </p>
                            </div>
                          </div>
                          {member.id !== user.id && (
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => navigate(`/chat/${member.id}`)}
                            >
                              Message
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              </SheetContent>
            </Sheet>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[200px]">
                <DropdownMenuItem>
                  <Info className="h-4 w-4 mr-2" />
                  Group info
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setShowMembers(true)}>
                  <Users className="h-4 w-4 mr-2" />
                  See all members
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Search className="h-4 w-4 mr-2" />
                  Search in conversation
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <BellOff className="h-4 w-4 mr-2" />
                  Mute notifications
                </DropdownMenuItem>
                {isAdmin && availableContacts.length > 0 && (
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger>
                      <UserPlus className="h-4 w-4 mr-2" />
                      Add members
                    </DropdownMenuSubTrigger>
                    <DropdownMenuPortal>
                      <DropdownMenuSubContent className="w-[200px]">
                        <div className="px-2 py-1.5 text-sm">
                          Select a contact to add
                        </div>
                        <DropdownMenuSeparator />
                        {availableContacts.map(contact => (
                          <DropdownMenuItem 
                            key={contact.id}
                            onClick={() => handleAddMember(contact.id)}
                          >
                            <Avatar className="h-5 w-5 mr-2">
                              <AvatarImage src={contact.avatar} alt={contact.name} />
                              <AvatarFallback>{contact.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            {contact.name}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuSubContent>
                    </DropdownMenuPortal>
                  </DropdownMenuSub>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setShowDeleteAlert(true)}>
                  <Trash className="h-4 w-4 mr-2" />
                  Clear chat history
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="text-destructive focus:text-destructive"
                  onClick={() => setShowLeaveAlert(true)}
                >
                  <Trash className="h-4 w-4 mr-2" />
                  {isAdmin ? "Delete group" : "Leave group"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Messages Area */}
        <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
          {isLoading ? (
            <div className="flex justify-center p-4">
              <p className="text-muted-foreground">Loading messages...</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-4 text-center">
              <Avatar className="h-16 w-16 mb-4">
                <AvatarImage src={group.avatar} alt={group.name} />
                <AvatarFallback>{group.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <h3 className="text-lg font-medium mb-2">{group.name}</h3>
              <p className="text-muted-foreground mb-6 max-w-md">
                This is the beginning of the {group.name} group chat.
                {isAdmin ? " As the admin, start the conversation!" : ""}
              </p>
              <Button onClick={() => handleSendMessage(`Hello everyone in ${group.name}! 👋`)}>
                Start Conversation
              </Button>
            </div>
          ) : (
            <div className="space-y-6 pb-4">
              {messages.map((message) => (
                <ChatMessage 
                  key={message.id} 
                  message={message} 
                  onReply={handleReply}
                  onDelete={() => deleteMessage(message.id)}
                />
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Reply Indicator */}
        {replyTo && (
          <div className="px-4 py-2 border-t border-border/50 bg-background/80 animate-slide-in">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-1 h-6 bg-primary/50 rounded-full mr-2" />
                <div>
                  <span className="text-xs font-medium">
                    Replying to {replyTo.isOwnMessage ? "yourself" : replyTo.senderName}
                  </span>
                  <p className="text-xs text-muted-foreground truncate max-w-xs">
                    {replyTo.content}
                  </p>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-6 w-6 rounded-full"
                onClick={() => setReplyTo(null)}
              >
                <Trash className="h-3 w-3" />
              </Button>
            </div>
          </div>
        )}

        {/* Message Input */}
        <MessageInput onSendMessage={handleSendMessage} />

        {/* Leave Group Alert Dialog */}
        <AlertDialog open={showLeaveAlert} onOpenChange={setShowLeaveAlert}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {isAdmin ? "Delete Group" : "Leave Group"}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {isAdmin 
                  ? "This will permanently delete the group and all messages. This action cannot be undone."
                  : "Are you sure you want to leave this group? You'll need to be added back by an admin to rejoin."
                }
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleLeaveGroup} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                {isAdmin ? "Delete Group" : "Leave Group"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Delete Chat History Alert Dialog */}
        <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Clear Chat History</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete all messages in this group chat.
                This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteChat} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Clear History
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
