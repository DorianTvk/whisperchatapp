
import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ModeToggle } from "@/components/mode-toggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import AddContactDialog from "@/components/AddContactDialog";
import StatusChanger from "@/components/StatusChanger";
import { useAuth } from "@/context/auth-context";
import { useToast } from "@/hooks/use-toast";
import { 
  Settings, 
  LogOut, 
  Search, 
  MessageSquare, 
  Bot,
  UserPlus, 
  MoreVertical,
  UserX,
  User,
  Badge as BadgeIcon
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function ChatSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, contacts, ais, logout, removeContact } = useAuth();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredContacts, setFilteredContacts] = useState(contacts);
  const [filteredAis, setFilteredAis] = useState(ais);
  const [filteredFriends, setFilteredFriends] = useState<typeof contacts>([]);
  const [currentTab, setCurrentTab] = useState("chats");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);
  const [imageUploadDialogOpen, setImageUploadDialogOpen] = useState(false);

  useEffect(() => {
    // Filter contacts and ais based on search query
    if (searchQuery) {
      setFilteredContacts(
        contacts.filter((contact) =>
          contact.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
      setFilteredAis(
        ais.filter((ai) =>
          ai.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          ai.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          ai.provider.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
      
      // Filter friends
      if (user) {
        const friends = contacts.filter(contact => 
          user.friends.includes(contact.id) && 
          contact.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setFilteredFriends(friends);
      }
    } else {
      setFilteredContacts(contacts);
      setFilteredAis(ais);
      
      // Set friends
      if (user) {
        const friends = contacts.filter(contact => user.friends.includes(contact.id));
        setFilteredFriends(friends);
      }
    }
  }, [searchQuery, contacts, ais, user]);

  // Determine if we're in a chat page
  const isInChatPage = location.pathname.includes('/chat/') || location.pathname.includes('/ai/');
  
  // Auto-select the appropriate tab based on current route
  useEffect(() => {
    if (location.pathname.includes('/chat/')) {
      setCurrentTab("chats");
    } else if (location.pathname.includes('/ai/')) {
      setCurrentTab("ais");
    }
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleDeleteContact = async (contactId: string) => {
    try {
      setShowDeleteConfirm(false);
      await removeContact(contactId);
      
      toast({
        title: "Contact removed",
        description: "The contact has been removed from your friends list"
      });
      
      // If we're on the page of the contact being deleted, navigate to dashboard
      if (location.pathname === `/chat/${contactId}`) {
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Failed to delete contact:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to remove contact"
      });
    }
  };

  // Function to refresh the contact and group lists
  const refreshLists = () => {
    setSearchQuery(""); // Reset search to show all contacts/groups
  };

  const simulateImageUpload = () => {
    // This would trigger a file input in a real implementation
    setImageUploadDialogOpen(true);
  };

  const handleImageSelected = () => {
    // This would handle the image selection in a real implementation
    setImageUploadDialogOpen(false);
    toast({
      title: "Image selected",
      description: "Your image is ready to send"
    });
  };

  return (
    <div className="h-screen flex flex-col border-r border-border/50 glass">
      {/* Header */}
      <div className="p-4 border-b border-border/50">
        <div className="flex items-center justify-between">
          <Link to="/dashboard">
            <h1 className="text-xl font-bold">Whisper</h1>
          </Link>
          <div className="flex items-center space-x-1">
            <StatusChanger 
              trigger={
                <Button variant="ghost" size="icon" className="rounded-full">
                  <div className="relative">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user?.avatar} alt={user?.username} />
                      <AvatarFallback>{user?.username?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span 
                      className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background ${
                        user?.status === "online" ? "bg-green-500" : 
                        user?.status === "away" ? "bg-amber-500" : 
                        user?.status === "busy" ? "bg-red-500" : "bg-slate-500"
                      }`}
                    />
                  </div>
                </Button>
              }
            />
            <ModeToggle />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <div className="flex items-center justify-start p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    {user && (
                      <>
                        <p className="font-medium">{user.username}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </>
                    )}
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/profile">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Search */}
        <div className="relative mt-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={currentTab} onValueChange={setCurrentTab} className="flex-1 flex flex-col overflow-hidden">
        <TabsList className="grid grid-cols-3 m-2">
          <TabsTrigger value="chats">
            <MessageSquare className="h-4 w-4 mr-2" /> Chats
          </TabsTrigger>
          <TabsTrigger value="ais">
            <Bot className="h-4 w-4 mr-2" /> AIs
          </TabsTrigger>
          <TabsTrigger value="friends">
            <User className="h-4 w-4 mr-2" /> Friends
          </TabsTrigger>
        </TabsList>

        <TabsContent value="chats" className="flex-1 overflow-hidden flex flex-col">
          <div className="px-2 py-1 flex items-center justify-between">
            <h2 className="text-sm font-medium">Direct Messages</h2>
            <AddContactDialog 
              trigger={
                <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full">
                  <UserPlus className="h-4 w-4" />
                </Button>
              }
              onContactAdded={refreshLists}
            />
          </div>
          <ScrollArea className="flex-1 px-2">
            <div className="space-y-1 py-1">
              {filteredContacts.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-sm text-muted-foreground">No contacts found</p>
                  {searchQuery && (
                    <Button 
                      variant="link" 
                      className="text-xs p-0 h-auto" 
                      onClick={() => setSearchQuery("")}
                    >
                      Clear search
                    </Button>
                  )}
                </div>
              ) : (
                filteredContacts.map((contact) => (
                  <Link 
                    key={contact.id} 
                    to={`/chat/${contact.id}`}
                    className={`flex items-center justify-between rounded-md px-2 py-1.5 transition-colors ${
                      location.pathname === `/chat/${contact.id}` 
                        ? "bg-muted" 
                        : "hover:bg-muted/50"
                    }`}
                  >
                    <div className="flex items-center">
                      <div className="relative">
                        <Avatar className="h-8 w-8 mr-2">
                          <AvatarImage src={contact.avatar} alt={contact.name} />
                          <AvatarFallback>{contact.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span 
                          className={`absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-background ${
                            contact.status === "online" ? "bg-green-500" : 
                            contact.status === "away" ? "bg-amber-500" : 
                            contact.status === "busy" ? "bg-red-500" : "bg-slate-500"
                          }`}
                        />
                      </div>
                      <div className="space-y-0.5">
                        <h3 className="text-sm font-medium">{contact.name}</h3>
                        <p className="text-xs text-muted-foreground truncate w-28">
                          {contact.status === "online" ? "Online" : `Last seen ${contact.lastActive}`}
                        </p>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-7 w-7 rounded-full opacity-0 group-hover:opacity-100 hover:opacity-100"
                          onClick={(e) => e.preventDefault()}
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" side="right">
                        <DropdownMenuItem 
                          onClick={(e) => {
                            e.preventDefault();
                            setSelectedContactId(contact.id);
                            setShowDeleteConfirm(true);
                          }}
                          className="text-destructive focus:text-destructive"
                        >
                          <UserX className="mr-2 h-4 w-4" />
                          Remove Contact
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </Link>
                ))
              )}

              {!searchQuery && (
                <div className="pt-2">
                  <AddContactDialog onContactAdded={refreshLists} />
                </div>
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="ais" className="flex-1 overflow-hidden flex flex-col">
          <div className="px-2 py-1 flex items-center justify-between">
            <h2 className="text-sm font-medium">AI Assistants</h2>
            <div className="flex items-center">
              <BadgeIcon className="h-4 w-4 mr-1" />
              <span className="text-xs">{filteredAis.length}</span>
            </div>
          </div>
          <ScrollArea className="flex-1 px-2">
            <div className="space-y-1 py-1">
              {filteredAis.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-sm text-muted-foreground">No AI assistants found</p>
                  {searchQuery && (
                    <Button 
                      variant="link" 
                      className="text-xs p-0 h-auto" 
                      onClick={() => setSearchQuery("")}
                    >
                      Clear search
                    </Button>
                  )}
                </div>
              ) : (
                filteredAis.map((ai) => (
                  <Link 
                    key={ai.id} 
                    to={`/ai/${ai.id}`}
                    className={`flex items-center space-x-3 rounded-md px-2 py-1.5 transition-colors ${
                      location.pathname === `/ai/${ai.id}` 
                        ? "bg-muted" 
                        : "hover:bg-muted/50"
                    }`}
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={ai.avatar} alt={ai.name} />
                      <AvatarFallback>
                        <Bot className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="space-y-0.5 flex-1 min-w-0">
                      <div className="flex items-center">
                        <h3 className="text-sm font-medium truncate">{ai.name}</h3>
                        {ai.isAvailable && (
                          <span className="ml-2 h-1.5 w-1.5 rounded-full bg-green-500"></span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {ai.description}
                      </p>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="friends" className="flex-1 overflow-hidden flex flex-col">
          <div className="px-2 py-1 flex items-center justify-between">
            <h2 className="text-sm font-medium">Your Friends</h2>
            <AddContactDialog 
              trigger={
                <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full">
                  <UserPlus className="h-4 w-4" />
                </Button>
              }
              onContactAdded={refreshLists}
            />
          </div>
          <ScrollArea className="flex-1 px-2">
            <div className="space-y-1 py-1">
              {filteredFriends.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-sm text-muted-foreground">No friends found</p>
                  {searchQuery ? (
                    <Button 
                      variant="link" 
                      className="text-xs p-0 h-auto" 
                      onClick={() => setSearchQuery("")}
                    >
                      Clear search
                    </Button>
                  ) : (
                    <div className="mt-2">
                      <AddContactDialog 
                        trigger={
                          <Button variant="outline" size="sm">
                            <UserPlus className="mr-2 h-4 w-4" />
                            Add Friends
                          </Button>
                        }
                        onContactAdded={refreshLists}
                      />
                    </div>
                  )}
                </div>
              ) : (
                filteredFriends.map((friend) => (
                  <div 
                    key={friend.id} 
                    className="flex items-center justify-between rounded-md px-2 py-2 hover:bg-muted/50"
                  >
                    <div className="flex items-center">
                      <div className="relative">
                        <Avatar className="h-8 w-8 mr-2">
                          <AvatarImage src={friend.avatar} alt={friend.name} />
                          <AvatarFallback>{friend.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span 
                          className={`absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-background ${
                            friend.status === "online" ? "bg-green-500" : 
                            friend.status === "away" ? "bg-amber-500" : 
                            friend.status === "busy" ? "bg-red-500" : "bg-slate-500"
                          }`}
                        />
                      </div>
                      <div>
                        <h3 className="text-sm font-medium">{friend.name}</h3>
                        <p className="text-xs text-muted-foreground">
                          {friend.statusMessage || 
                            (friend.status === "online" ? "Online" : 
                             friend.status === "away" ? "Away" : 
                             friend.status === "busy" ? "Busy" : "Offline")}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-7 w-7 rounded-full"
                        onClick={() => navigate(`/chat/${friend.id}`)}
                      >
                        <MessageSquare className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-7 w-7 rounded-full text-destructive hover:text-destructive"
                        onClick={() => {
                          setSelectedContactId(friend.id);
                          setShowDeleteConfirm(true);
                        }}
                      >
                        <UserX className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>

      {/* Bottom Section - only shown when not in a chat page on mobile */}
      {!isInChatPage && (
        <>
          <Separator />
          <div className="p-4">
            <Link to="/profile">
              <Button variant="outline" className="w-full">
                <Settings className="mr-2 h-4 w-4" />
                Profile Settings
              </Button>
            </Link>
          </div>
        </>
      )}

      {/* Delete Contact Confirmation Dialog */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent>
          <DialogTitle>Remove Contact</DialogTitle>
          <DialogDescription>
            Are you sure you want to remove this contact? This will also remove them from your friends list.
          </DialogDescription>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => selectedContactId && handleDeleteContact(selectedContactId)}
            >
              <UserX className="mr-2 h-4 w-4" />
              Remove
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Image Upload Dialog (Mock) */}
      <Dialog open={imageUploadDialogOpen} onOpenChange={setImageUploadDialogOpen}>
        <DialogContent>
          <DialogTitle>Select an Image</DialogTitle>
          <DialogDescription>
            Choose an image from your device to send in the chat.
          </DialogDescription>
          <div className="py-4 flex flex-col items-center space-y-4">
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center hover:border-muted-foreground/50 cursor-pointer">
              <input type="file" id="file-upload" className="hidden" />
              <label htmlFor="file-upload" className="cursor-pointer">
                <div className="flex flex-col items-center">
                  <img 
                    src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158" 
                    alt="Preview" 
                    className="w-48 h-48 object-cover rounded-lg mb-4" 
                  />
                  <p className="text-sm text-muted-foreground">Click to select a different image</p>
                </div>
              </label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setImageUploadDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleImageSelected}>
              Send Image
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
