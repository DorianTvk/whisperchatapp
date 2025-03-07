import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import ChatSidebar from "@/components/ChatSidebar";
import { useAuth } from "@/context/auth-context";
import { Search, MessageSquare, Bot, Plus } from "lucide-react";

// AI Profile Pictures
const AI_AVATARS = {
  "ChatGPT": "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b"
};

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, contacts, ais } = useAuth();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredContacts, setFilteredContacts] = useState(contacts);
  const [filteredAis, setFilteredAis] = useState(ais);
  
  useEffect(() => {
    // Filter contacts and ais based on search query
    if (searchQuery.trim()) {
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
    } else {
      setFilteredContacts(contacts);
      setFilteredAis(ais);
    }
  }, [searchQuery, contacts, ais]);

  // Assign avatars to AIs if they don't have one
  const enhancedAis = filteredAis.map(ai => ({
    ...ai,
    avatar: ai.avatar || AI_AVATARS[ai.name] || "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5"
  }));

  if (!user) return null;

  const startNewChat = (aiId: string) => {
    navigate(`/ai/${aiId}?new=true`);
  };

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
                placeholder="Search for contacts, AIs or messages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <Tabs defaultValue="recent" className="space-y-4">
              <TabsList className="w-full grid grid-cols-3 gap-2">
                <TabsTrigger value="recent" className="rounded-lg">Recent</TabsTrigger>
                <TabsTrigger value="contacts" className="rounded-lg">Contacts</TabsTrigger>
                <TabsTrigger value="ais" className="rounded-lg">AIs</TabsTrigger>
              </TabsList>
              
              {/* Recent Tab */}
              <TabsContent value="recent" className="space-y-4">
                <Card className="border-border/40">
                  <CardHeader className="pb-2">
                    <CardTitle>Recent Chats</CardTitle>
                    <CardDescription>Your most recent conversations</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[400px] pr-4">
                      <div className="space-y-3">
                        {filteredContacts.slice(0, 3).map((contact) => (
                          <div 
                            key={contact.id}
                            className="flex items-center justify-between p-3 rounded-lg hover:bg-muted cursor-pointer transition-colors"
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
                        
                        {enhancedAis.slice(0, 2).map((ai) => (
                          <div 
                            key={ai.id}
                            className="flex items-center justify-between p-3 rounded-lg hover:bg-muted cursor-pointer transition-colors"
                            onClick={() => navigate(`/ai/${ai.id}`)}
                          >
                            <div className="flex items-center">
                              <Avatar className="h-10 w-10 mr-3">
                                <AvatarImage src={ai.avatar} alt={ai.name} />
                                <AvatarFallback>
                                  <Bot className="h-5 w-5" />
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <h4 className="text-sm font-medium">{ai.name}</h4>
                                <p className="text-xs text-muted-foreground">
                                  {ai.provider}
                                </p>
                              </div>
                            </div>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={(e) => {
                                e.stopPropagation();
                                startNewChat(ai.id);
                              }}
                            >
                              <Bot className="h-4 w-4 text-muted-foreground" />
                            </Button>
                          </div>
                        ))}
                        
                        {filteredContacts.length === 0 && enhancedAis.length === 0 && (
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
              <TabsContent value="contacts" className="space-y-4">
                <Card className="border-border/40">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <div>
                      <CardTitle>Contacts</CardTitle>
                      <CardDescription>Your contacts and friends</CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[400px] pr-4">
                      <div className="space-y-3">
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
                              className="flex items-center justify-between p-3 rounded-lg hover:bg-muted cursor-pointer transition-colors"
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
              
              {/* AIs Tab */}
              <TabsContent value="ais" className="space-y-4">
                <Card className="border-border/40">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <div>
                      <CardTitle>AI Assistants</CardTitle>
                      <CardDescription>Chat with AI assistants and get help</CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[400px] pr-4">
                      <div className="space-y-3">
                        {enhancedAis.length === 0 ? (
                          <div className="text-center py-10">
                            {searchQuery ? (
                              <p className="text-muted-foreground">No AI assistants found for "{searchQuery}"</p>
                            ) : (
                              <p className="text-muted-foreground">No AI assistants available</p>
                            )}
                          </div>
                        ) : (
                          enhancedAis.map((ai) => (
                            <div 
                              key={ai.id}
                              className="flex items-center justify-between p-3 rounded-lg hover:bg-muted cursor-pointer transition-colors"
                              onClick={() => navigate(`/ai/${ai.id}`)}
                            >
                              <div className="flex items-center flex-1 min-w-0">
                                <Avatar className="h-12 w-12 mr-3 shrink-0">
                                  <AvatarImage src={ai.avatar} alt={ai.name} />
                                  <AvatarFallback>
                                    <Bot className="h-5 w-5" />
                                  </AvatarFallback>
                                </Avatar>
                                <div className="min-w-0">
                                  <div className="flex items-center">
                                    <h4 className="text-sm font-medium">{ai.name}</h4>
                                    {ai.isAvailable && (
                                      <span className="ml-2 h-2 w-2 rounded-full bg-green-500"></span>
                                    )}
                                  </div>
                                  <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                                    {ai.description}
                                  </p>
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {ai.capabilities.slice(0, 2).map((capability, idx) => (
                                      <Badge key={idx} variant="outline" className="text-xs px-1.5 py-0 bg-muted">
                                        {capability}
                                      </Badge>
                                    ))}
                                    {ai.capabilities.length > 2 && (
                                      <Badge variant="outline" className="text-xs px-1.5 py-0 bg-muted">
                                        +{ai.capabilities.length - 2}
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <div className="flex gap-2 ml-2">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  className="flex items-center gap-1"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    startNewChat(ai.id);
                                  }}
                                >
                                  <Plus className="h-3 w-3" />
                                  <span className="text-xs">New Chat</span>
                                </Button>
                                <Button 
                                  variant="outline" 
                                  className="h-8 w-8 p-0 rounded-full"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(`/ai/${ai.id}`);
                                  }}
                                >
                                  <Bot className="h-4 w-4" />
                                </Button>
                              </div>
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
