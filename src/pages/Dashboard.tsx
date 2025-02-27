
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ChatSidebar from "@/components/ChatSidebar";
import { useAuth } from "@/context/auth-context";
import { Link } from "react-router-dom";
import { MessageSquare, Users, Plus, Search, Pin, Calendar, Video, UserPlus } from "lucide-react";

// Mock data
const recentChats = [
  { id: "user_1", name: "Alex Johnson", avatar: "/placeholder.svg", status: "online", lastActive: "Now" },
  { id: "user_2", name: "Maria Garcia", avatar: "/placeholder.svg", status: "offline", lastActive: "1h ago" },
  { id: "user_4", name: "Emma Wilson", avatar: "/placeholder.svg", status: "online", lastActive: "Now" },
  { id: "user_3", name: "James Smith", avatar: "/placeholder.svg", status: "away", lastActive: "30m ago" },
];

const recentGroups = [
  { id: "group_1", name: "Design Team", avatar: "/placeholder.svg", members: 8, lastActive: "12m ago" },
  { id: "group_2", name: "Project Alpha", avatar: "/placeholder.svg", members: 5, lastActive: "1h ago" },
  { id: "group_3", name: "Friends", avatar: "/placeholder.svg", members: 12, lastActive: "2h ago" },
];

export default function Dashboard() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="flex h-screen bg-background/50">
      {/* Sidebar */}
      <div className="w-72 hidden md:block">
        <ChatSidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="px-6 py-4 border-b border-border/50 glass">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold">Dashboard</h1>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="icon" className="md:hidden">
                <MessageSquare className="h-5 w-5" />
              </Button>
              <Avatar className="h-8 w-8">
                <AvatarImage src={user?.avatar} alt={user?.username} />
                <AvatarFallback>{user?.username?.charAt(0)}</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="flex-1 overflow-auto p-6 animate-fade-in">
          <div className="max-w-5xl mx-auto">
            {/* Welcome Section */}
            <div className="glass rounded-xl p-6 mb-8 border border-border/50 animate-scale-in">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold mb-1">Welcome back, {user?.username}!</h2>
                  <p className="text-muted-foreground">Your conversations are waiting for you</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" className="h-9">
                    <Plus className="h-4 w-4 mr-1" /> New Chat
                  </Button>
                  <Button size="sm" variant="outline" className="h-9">
                    <Video className="h-4 w-4 mr-1" /> Start Call
                  </Button>
                </div>
              </div>
            </div>

            {/* Search */}
            <div className="relative mb-8 animate-fade-in" style={{ animationDelay: "100ms" }}>
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search for people, groups or messages..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Tabs for Direct & Group chats */}
            <Tabs defaultValue="direct" className="animate-fade-in" style={{ animationDelay: "200ms" }}>
              <TabsList className="w-full max-w-xs mb-6">
                <TabsTrigger value="direct" className="flex-1">
                  <MessageSquare className="h-4 w-4 mr-2" /> Direct Messages
                </TabsTrigger>
                <TabsTrigger value="groups" className="flex-1">
                  <Users className="h-4 w-4 mr-2" /> Group Chats
                </TabsTrigger>
              </TabsList>

              <TabsContent value="direct" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {recentChats.map((chat, index) => (
                    <Link to={`/chat/${chat.id}`} key={chat.id}>
                      <div 
                        className="glass rounded-lg p-4 border border-border/50 hover:border-border transition-all hover:shadow-sm animate-scale-in cursor-pointer" 
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <div className="flex items-start space-x-3">
                          <div className="relative">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={chat.avatar} alt={chat.name} />
                              <AvatarFallback>{chat.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <span 
                              className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background ${
                                chat.status === "online" ? "bg-green-500" : 
                                chat.status === "away" ? "bg-yellow-500" : "bg-muted"
                              }`}
                            />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-medium truncate">{chat.name}</h3>
                            <p className="text-xs text-muted-foreground">Active: {chat.lastActive}</p>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                  <Button 
                    variant="outline" 
                    className="rounded-lg h-auto p-4 flex flex-col items-center justify-center space-y-2 border-dashed animate-scale-in" 
                    style={{ animationDelay: `${recentChats.length * 50}ms` }}
                  >
                    <UserPlus className="h-6 w-6 text-muted-foreground" />
                    <span className="text-sm font-normal text-muted-foreground">Add New Contact</span>
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="groups" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {recentGroups.map((group, index) => (
                    <Link to={`/group/${group.id}`} key={group.id}>
                      <div 
                        className="glass rounded-lg p-4 border border-border/50 hover:border-border transition-all hover:shadow-sm animate-scale-in cursor-pointer" 
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <div className="flex items-start space-x-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={group.avatar} alt={group.name} />
                            <AvatarFallback>{group.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <h3 className="font-medium truncate">{group.name}</h3>
                            <p className="text-xs text-muted-foreground">{group.members} members • {group.lastActive}</p>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                  <Button 
                    variant="outline" 
                    className="rounded-lg h-auto p-4 flex flex-col items-center justify-center space-y-2 border-dashed animate-scale-in" 
                    style={{ animationDelay: `${recentGroups.length * 50}ms` }}
                  >
                    <Plus className="h-6 w-6 text-muted-foreground" />
                    <span className="text-sm font-normal text-muted-foreground">Create New Group</span>
                  </Button>
                </div>
              </TabsContent>
            </Tabs>

            {/* Quick Actions */}
            <div className="mt-8 animate-fade-in" style={{ animationDelay: "300ms" }}>
              <h2 className="text-lg font-medium mb-4">Quick Actions</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <Button variant="outline" className="h-auto p-4 justify-start">
                  <Pin className="h-5 w-5 mr-3 text-muted-foreground" />
                  <div className="text-left">
                    <h3 className="font-medium text-sm">Pinned Messages</h3>
                    <p className="text-xs text-muted-foreground">View your important messages</p>
                  </div>
                </Button>
                <Button variant="outline" className="h-auto p-4 justify-start">
                  <Calendar className="h-5 w-5 mr-3 text-muted-foreground" />
                  <div className="text-left">
                    <h3 className="font-medium text-sm">Scheduled Meetings</h3>
                    <p className="text-xs text-muted-foreground">Manage your upcoming calls</p>
                  </div>
                </Button>
                <Button variant="outline" className="h-auto p-4 justify-start">
                  <Users className="h-5 w-5 mr-3 text-muted-foreground" />
                  <div className="text-left">
                    <h3 className="font-medium text-sm">Contacts</h3>
                    <p className="text-xs text-muted-foreground">Manage your contact list</p>
                  </div>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
