
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/context/auth-context";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { ModeToggle } from "@/components/mode-toggle";
import {
  MessageSquare,
  Users,
  UserPlus,
  LogOut,
  Search,
  Plus,
  User,
  Settings,
} from "lucide-react";

// Mock data
const MOCK_DIRECT_CHATS = [
  { id: "user_1", name: "Alex Johnson", avatar: "/placeholder.svg", lastMessage: "Hey there!", unread: 2 },
  { id: "user_2", name: "Maria Garcia", avatar: "/placeholder.svg", lastMessage: "Let's meet tomorrow" },
  { id: "user_3", name: "James Smith", avatar: "/placeholder.svg", lastMessage: "Thanks for the help!" },
  { id: "user_4", name: "Emma Wilson", avatar: "/placeholder.svg", lastMessage: "Did you see the new design?" },
];

const MOCK_GROUP_CHATS = [
  { id: "group_1", name: "Design Team", avatar: "/placeholder.svg", lastMessage: "Meeting at 2pm", members: 8 },
  { id: "group_2", name: "Project Alpha", avatar: "/placeholder.svg", lastMessage: "Let's finalize the mockups", members: 5 },
  { id: "group_3", name: "Friends", avatar: "/placeholder.svg", lastMessage: "Who's up for dinner?", members: 12 },
];

export default function ChatSidebar() {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredDirectChats, setFilteredDirectChats] = useState(MOCK_DIRECT_CHATS);
  const [filteredGroupChats, setFilteredGroupChats] = useState(MOCK_GROUP_CHATS);

  useEffect(() => {
    if (searchQuery) {
      setFilteredDirectChats(
        MOCK_DIRECT_CHATS.filter((chat) =>
          chat.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
      setFilteredGroupChats(
        MOCK_GROUP_CHATS.filter((chat) =>
          chat.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    } else {
      setFilteredDirectChats(MOCK_DIRECT_CHATS);
      setFilteredGroupChats(MOCK_GROUP_CHATS);
    }
  }, [searchQuery]);

  return (
    <div className="flex flex-col h-full border-r border-border/50 glass">
      {/* Sidebar Header */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          <h2 className="font-semibold text-lg">Whisper</h2>
        </div>
        <ModeToggle />
      </div>
      
      {/* Search */}
      <div className="px-4 pb-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search conversations..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Chats */}
      <ScrollArea className="flex-1 px-4">
        <div className="py-2">
          <div className="flex items-center justify-between pb-2">
            <h3 className="text-sm font-medium text-muted-foreground">Direct Messages</h3>
            <Button variant="ghost" size="icon" className="h-7 w-7">
              <UserPlus className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="space-y-1">
            {filteredDirectChats.map((chat) => (
              <Button
                key={chat.id}
                variant="ghost"
                className={`w-full justify-start px-2 py-6 h-auto relative ${
                  location.pathname === `/chat/${chat.id}` ? "bg-accent" : ""
                }`}
                asChild
              >
                <Link to={`/chat/${chat.id}`}>
                  <Avatar className="h-8 w-8 mr-3">
                    <AvatarImage src={chat.avatar} alt={chat.name} />
                    <AvatarFallback>{chat.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col items-start text-left overflow-hidden">
                    <span className="font-medium text-sm truncate w-full">{chat.name}</span>
                    <span className="text-xs text-muted-foreground truncate w-full">
                      {chat.lastMessage}
                    </span>
                  </div>
                  {chat.unread && (
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 bg-primary text-primary-foreground rounded-full h-5 w-5 flex items-center justify-center text-xs">
                      {chat.unread}
                    </div>
                  )}
                </Link>
              </Button>
            ))}
          </div>
        </div>

        <Separator className="my-2" />

        <div className="py-2">
          <div className="flex items-center justify-between pb-2">
            <h3 className="text-sm font-medium text-muted-foreground">Groups</h3>
            <Button variant="ghost" size="icon" className="h-7 w-7">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="space-y-1">
            {filteredGroupChats.map((group) => (
              <Button
                key={group.id}
                variant="ghost"
                className={`w-full justify-start px-2 py-6 h-auto ${
                  location.pathname === `/group/${group.id}` ? "bg-accent" : ""
                }`}
                asChild
              >
                <Link to={`/group/${group.id}`}>
                  <Avatar className="h-8 w-8 mr-3">
                    <AvatarImage src={group.avatar} alt={group.name} />
                    <AvatarFallback>{group.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col items-start text-left overflow-hidden">
                    <div className="flex items-center">
                      <span className="font-medium text-sm truncate">{group.name}</span>
                      <span className="ml-1 text-xs text-muted-foreground">({group.members})</span>
                    </div>
                    <span className="text-xs text-muted-foreground truncate w-full">
                      {group.lastMessage}
                    </span>
                  </div>
                </Link>
              </Button>
            ))}
          </div>
        </div>
      </ScrollArea>

      {/* Profile Section */}
      <div className="p-4 border-t border-border/50 flex items-center justify-between">
        <Button variant="ghost" className="flex items-center px-2" asChild>
          <Link to="/profile">
            <Avatar className="h-8 w-8 mr-2">
              <AvatarImage src={user?.avatar} alt={user?.username} />
              <AvatarFallback>{user?.username?.charAt(0)}</AvatarFallback>
            </Avatar>
            <span className="font-medium text-sm">{user?.username}</span>
          </Link>
        </Button>
        <div className="flex items-center">
          <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
            <Link to="/profile">
              <Settings className="h-4 w-4" />
            </Link>
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={logout}>
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
