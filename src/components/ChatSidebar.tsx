
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
import AddContactDialog from "@/components/AddContactDialog";
import CreateGroupDialog from "@/components/CreateGroupDialog";
import { useAuth } from "@/context/auth-context";
import { 
  Settings, 
  LogOut, 
  Search, 
  MessageSquare, 
  Users, 
  UserPlus, 
  Plus,
  Trash,
  MoreVertical
} from "lucide-react";

export default function ChatSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, contacts, groups, logout, removeContact } = useAuth();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredContacts, setFilteredContacts] = useState(contacts);
  const [filteredGroups, setFilteredGroups] = useState(groups);
  const [currentTab, setCurrentTab] = useState("chats");

  useEffect(() => {
    // Filter contacts and groups based on search query
    if (searchQuery) {
      setFilteredContacts(
        contacts.filter((contact) =>
          contact.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
      setFilteredGroups(
        groups.filter((group) =>
          group.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    } else {
      setFilteredContacts(contacts);
      setFilteredGroups(groups);
    }
  }, [searchQuery, contacts, groups]);

  // Determine if we're in a chat page
  const isInChatPage = location.pathname.includes('/chat/') || location.pathname.includes('/group/');
  
  // Auto-select the appropriate tab based on current route
  useEffect(() => {
    if (location.pathname.includes('/chat/')) {
      setCurrentTab("chats");
    } else if (location.pathname.includes('/group/')) {
      setCurrentTab("groups");
    }
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleDeleteContact = async (contactId: string, e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation
    e.stopPropagation(); // Prevent click from bubbling
    
    try {
      await removeContact(contactId);
      // If we're on the page of the contact being deleted, navigate to dashboard
      if (location.pathname === `/chat/${contactId}`) {
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Failed to delete contact:", error);
    }
  };

  // Function to refresh the contact and group lists
  const refreshLists = () => {
    setSearchQuery(""); // Reset search to show all contacts/groups
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
            <ModeToggle />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.avatar} alt={user?.username} />
                    <AvatarFallback>{user?.username?.charAt(0)}</AvatarFallback>
                  </Avatar>
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
        <TabsList className="grid grid-cols-2 m-2">
          <TabsTrigger value="chats">
            <MessageSquare className="h-4 w-4 mr-2" /> Chats
          </TabsTrigger>
          <TabsTrigger value="groups">
            <Users className="h-4 w-4 mr-2" /> Groups
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
                            contact.status === "away" ? "bg-yellow-500" : "bg-muted"
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
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" side="right">
                        <DropdownMenuItem 
                          className="text-destructive focus:text-destructive"
                          onClick={(e) => handleDeleteContact(contact.id, e)}
                        >
                          <Trash className="mr-2 h-4 w-4" />
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

        <TabsContent value="groups" className="flex-1 overflow-hidden flex flex-col">
          <div className="px-2 py-1 flex items-center justify-between">
            <h2 className="text-sm font-medium">Group Chats</h2>
            <CreateGroupDialog 
              trigger={
                <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full">
                  <Plus className="h-4 w-4" />
                </Button>
              }
              onGroupCreated={refreshLists}
            />
          </div>
          <ScrollArea className="flex-1 px-2">
            <div className="space-y-1 py-1">
              {filteredGroups.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-sm text-muted-foreground">No groups found</p>
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
                filteredGroups.map((group) => (
                  <Link 
                    key={group.id} 
                    to={`/group/${group.id}`}
                    className={`flex items-center rounded-md px-2 py-1.5 transition-colors ${
                      location.pathname === `/group/${group.id}` 
                        ? "bg-muted" 
                        : "hover:bg-muted/50"
                    }`}
                  >
                    <Avatar className="h-8 w-8 mr-2">
                      <AvatarImage src={group.avatar} alt={group.name} />
                      <AvatarFallback>{group.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="space-y-0.5">
                      <h3 className="text-sm font-medium">{group.name}</h3>
                      <p className="text-xs text-muted-foreground">
                        {group.members.length} members
                      </p>
                    </div>
                  </Link>
                ))
              )}

              {!searchQuery && (
                <div className="pt-2">
                  <CreateGroupDialog onGroupCreated={refreshLists} />
                </div>
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
    </div>
  );
}
