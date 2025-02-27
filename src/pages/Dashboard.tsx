
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ChatSidebar from "@/components/ChatSidebar";
import { useAuth } from "@/context/auth-context";
import { Search, MessageSquare, Users } from "lucide-react";

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, contacts, groups } = useAuth();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredContacts, setFilteredContacts] = useState(contacts);
  const [filteredGroups, setFilteredGroups] = useState(groups);
  
  useEffect(() => {
    // Filter contacts and groups based on search query
    if (searchQuery.trim()) {
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

  if (!user) return null;

  return (
    <div className="flex h-screen bg-background/50">
      {/* Sidebar */}
      <div className="w-72 hidden md:block">
        <ChatSidebar />
      </div>

      {/* Main Dashboard */}
      <div className="flex-1 overflow-auto">
        <div className="container mx-auto max-w-5xl py-8 px-4 md:px-8">
          <div className="flex flex-col space-y-6">
            {/* Header with greeting */}
            <div className="flex flex-col space-y-2">
              <h1 className="text-3xl font-bold">Welcome back, {user.username}</h1>
              <p className="text-muted-foreground">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </p>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                className="pl-9"
                placeholder="Search for contacts, groups or messages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <Tabs defaultValue="recent">
              <TabsList>
                <TabsTrigger value="recent">Recent</TabsTrigger>
                <TabsTrigger value="contacts">Contacts</TabsTrigger>
                <TabsTrigger value="groups">Groups</TabsTrigger>
              </TabsList>
              
              {/* Recent Tab */}
              <TabsContent value="recent" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Chats</CardTitle>
                    <CardDescription>Your most recent conversations</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[400px] pr-4">
                      <div className="space-y-2">
                        {filteredContacts.slice(0, 3).map((contact) => (
                          <div 
                            key={contact.id}
                            className="flex items-center justify-between p-3 rounded-lg hover:bg-muted cursor-pointer"
                            onClick={() => navigate(`/chat/${contact.id}`)}
                          >
                            <div className="flex items-center">
                              <div className="relative">
                                <Avatar className="h-10 w-10 mr-3">
                                  <AvatarImage src={contact.avatar} alt={contact.name} />
                                  <AvatarFallback>{contact.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <span 
                                  className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background ${
                                    contact.status === "online" ? "bg-green-500" : 
                                    contact.status === "away" ? "bg-amber-500" : 
                                    contact.status === "busy" ? "bg-red-500" : "bg-slate-500"
                                  }`}
                                />
                              </div>
                              <div>
                                <h4 className="text-sm font-medium">{contact.name}</h4>
                                <p className="text-xs text-muted-foreground truncate max-w-[220px]">
                                  {contact.status === "online" ? "Online" : `Last seen ${contact.lastActive}`}
                                </p>
                              </div>
                            </div>
                            <MessageSquare className="h-4 w-4 text-muted-foreground" />
                          </div>
                        ))}
                        
                        {filteredGroups.slice(0, 2).map((group) => (
                          <div 
                            key={group.id}
                            className="flex items-center justify-between p-3 rounded-lg hover:bg-muted cursor-pointer"
                            onClick={() => navigate(`/group/${group.id}`)}
                          >
                            <div className="flex items-center">
                              <Avatar className="h-10 w-10 mr-3">
                                <AvatarImage src={group.avatar} alt={group.name} />
                                <AvatarFallback>{group.name.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <div>
                                <h4 className="text-sm font-medium">{group.name}</h4>
                                <p className="text-xs text-muted-foreground">
                                  {group.members.length} members
                                </p>
                              </div>
                            </div>
                            <Users className="h-4 w-4 text-muted-foreground" />
                          </div>
                        ))}
                        
                        {filteredContacts.length === 0 && filteredGroups.length === 0 && (
                          <div className="text-center py-10">
                            <p className="text-muted-foreground">No results found for "{searchQuery}"</p>
                          </div>
                        )}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Contacts Tab */}
              <TabsContent value="contacts" className="space-y-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <div>
                      <CardTitle>Contacts</CardTitle>
                      <CardDescription>Your contacts and friends</CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[400px] pr-4">
                      <div className="space-y-2">
                        {filteredContacts.length === 0 ? (
                          <div className="text-center py-10">
                            {searchQuery ? (
                              <p className="text-muted-foreground">No contacts found for "{searchQuery}"</p>
                            ) : (
                              <p className="text-muted-foreground">You don't have any contacts yet</p>
                            )}
                          </div>
                        ) : (
                          filteredContacts.map((contact) => (
                            <div 
                              key={contact.id}
                              className="flex items-center justify-between p-3 rounded-lg hover:bg-muted cursor-pointer"
                              onClick={() => navigate(`/chat/${contact.id}`)}
                            >
                              <div className="flex items-center">
                                <div className="relative">
                                  <Avatar className="h-10 w-10 mr-3">
                                    <AvatarImage src={contact.avatar} alt={contact.name} />
                                    <AvatarFallback>{contact.name.charAt(0)}</AvatarFallback>
                                  </Avatar>
                                  <span 
                                    className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background ${
                                      contact.status === "online" ? "bg-green-500" : 
                                      contact.status === "away" ? "bg-amber-500" : 
                                      contact.status === "busy" ? "bg-red-500" : "bg-slate-500"
                                    }`}
                                  />
                                </div>
                                <div>
                                  <h4 className="text-sm font-medium">{contact.name}</h4>
                                  <p className="text-xs text-muted-foreground truncate max-w-[220px]">
                                    {contact.status === "online" ? "Online" : `Last seen ${contact.lastActive}`}
                                  </p>
                                </div>
                              </div>
                              <Button 
                                variant="outline" 
                                className="h-8 w-8 p-0 rounded-full"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/chat/${contact.id}`);
                                }}
                              >
                                <MessageSquare className="h-4 w-4" />
                              </Button>
                            </div>
                          ))
                        )}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Groups Tab */}
              <TabsContent value="groups" className="space-y-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <div>
                      <CardTitle>Group Chats</CardTitle>
                      <CardDescription>Your group conversations</CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[400px] pr-4">
                      <div className="space-y-2">
                        {filteredGroups.length === 0 ? (
                          <div className="text-center py-10">
                            {searchQuery ? (
                              <p className="text-muted-foreground">No groups found for "{searchQuery}"</p>
                            ) : (
                              <p className="text-muted-foreground">You don't have any groups yet</p>
                            )}
                          </div>
                        ) : (
                          filteredGroups.map((group) => (
                            <div 
                              key={group.id}
                              className="flex items-center justify-between p-3 rounded-lg hover:bg-muted cursor-pointer"
                              onClick={() => navigate(`/group/${group.id}`)}
                            >
                              <div className="flex items-center">
                                <Avatar className="h-10 w-10 mr-3">
                                  <AvatarImage src={group.avatar} alt={group.name} />
                                  <AvatarFallback>{group.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div>
                                  <h4 className="text-sm font-medium">{group.name}</h4>
                                  <p className="text-xs text-muted-foreground">
                                    {group.members.length} members
                                  </p>
                                </div>
                              </div>
                              <Button 
                                variant="outline" 
                                className="h-8 w-8 p-0 rounded-full"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/group/${group.id}`);
                                }}
                              >
                                <Users className="h-4 w-4" />
                              </Button>
                            </div>
                          ))
                        )}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
