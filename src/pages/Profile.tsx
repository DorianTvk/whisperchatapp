
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/auth-context";
import ChatSidebar from "@/components/ChatSidebar";
import { ArrowLeft, User, Shield, Bell, LogOut, KeyRound, Trash, Save } from "lucide-react";

export default function Profile() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, logout, updateProfile } = useAuth();
  
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    username: user?.username || "",
    email: user?.email || "",
    bio: "Product designer and developer based in Stockholm.",
    notifications: true,
    darkMode: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      // Update user profile
      await updateProfile({
        username: formData.username,
      });
      
      setIsEditing(false);
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Update failed",
        description: "There was an error updating your profile",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
    toast({
      title: "Logged out",
      description: "You have been successfully logged out",
    });
  };

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
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              size="icon" 
              className="mr-2 md:hidden" 
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-semibold">Profile Settings</h1>
          </div>
        </header>

        {/* Profile Content */}
        <div className="flex-1 overflow-auto p-6 animate-fade-in">
          <div className="max-w-3xl mx-auto">
            <Tabs defaultValue="account" className="w-full">
              <TabsList className="grid grid-cols-3 w-full max-w-md mb-8">
                <TabsTrigger value="account">
                  <User className="h-4 w-4 mr-2" /> Account
                </TabsTrigger>
                <TabsTrigger value="security">
                  <Shield className="h-4 w-4 mr-2" /> Security
                </TabsTrigger>
                <TabsTrigger value="notifications">
                  <Bell className="h-4 w-4 mr-2" /> Notifications
                </TabsTrigger>
              </TabsList>

              <TabsContent value="account" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Profile Information</CardTitle>
                    <CardDescription>
                      Update your account details and public profile.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                      <Avatar className="h-20 w-20">
                        <AvatarImage src={user?.avatar} alt={user?.username} />
                        <AvatarFallback>{user?.username?.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="space-y-1.5">
                        <h3 className="font-medium">{user?.username}</h3>
                        <p className="text-sm text-muted-foreground">{user?.email}</p>
                        <Button variant="outline" size="sm" disabled={!isEditing}>
                          Change Avatar
                        </Button>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-4">
                      <div className="grid gap-2">
                        <Label htmlFor="username">Username</Label>
                        <Input
                          id="username"
                          name="username"
                          value={formData.username}
                          onChange={handleChange}
                          disabled={!isEditing}
                        />
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleChange}
                          disabled={true} // Email changes require verification
                        />
                        {isEditing && (
                          <p className="text-xs text-muted-foreground">
                            To change your email address, please contact support.
                          </p>
                        )}
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="bio">Bio</Label>
                        <Input
                          id="bio"
                          name="bio"
                          value={formData.bio}
                          onChange={handleChange}
                          disabled={!isEditing}
                        />
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    {isEditing ? (
                      <>
                        <Button variant="outline" onClick={() => setIsEditing(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleSaveProfile} disabled={isSaving}>
                          {isSaving ? (
                            <>Saving...</>
                          ) : (
                            <>
                              <Save className="mr-2 h-4 w-4" /> Save Changes
                            </>
                          )}
                        </Button>
                      </>
                    ) : (
                      <Button onClick={() => setIsEditing(true)}>
                        Edit Profile
                      </Button>
                    )}
                  </CardFooter>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Account Management</CardTitle>
                    <CardDescription>
                      Manage your account settings and preferences.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="space-y-0.5">
                        <h4 className="font-medium">Delete Account</h4>
                        <p className="text-sm text-muted-foreground">
                          Permanently delete your account and all your data.
                        </p>
                      </div>
                      <Button variant="destructive" size="sm">
                        <Trash className="mr-2 h-4 w-4" /> Delete
                      </Button>
                    </div>
                    <Separator className="my-4" />
                    <div className="flex justify-between items-center">
                      <div className="space-y-0.5">
                        <h4 className="font-medium">Log out</h4>
                        <p className="text-sm text-muted-foreground">
                          Sign out from your current session.
                        </p>
                      </div>
                      <Button variant="outline" size="sm" onClick={handleLogout}>
                        <LogOut className="mr-2 h-4 w-4" /> Logout
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="security" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Password</CardTitle>
                    <CardDescription>
                      Change your password and security settings.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-2">
                      <Label htmlFor="current-password">Current Password</Label>
                      <Input
                        id="current-password"
                        type="password"
                        placeholder="••••••••"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="new-password">New Password</Label>
                      <Input
                        id="new-password"
                        type="password"
                        placeholder="••••••••"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="confirm-password">Confirm New Password</Label>
                      <Input
                        id="confirm-password"
                        type="password"
                        placeholder="••••••••"
                      />
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button>
                      <KeyRound className="mr-2 h-4 w-4" /> Update Password
                    </Button>
                  </CardFooter>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Two-Factor Authentication</CardTitle>
                    <CardDescription>
                      Add an extra layer of security to your account.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center">
                      <div className="space-y-0.5">
                        <h4 className="font-medium">Enable 2FA</h4>
                        <p className="text-sm text-muted-foreground">
                          Protect your account with two-factor authentication.
                        </p>
                      </div>
                      <Button variant="outline">Setup 2FA</Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="notifications" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Notification Preferences</CardTitle>
                    <CardDescription>
                      Choose how you want to be notified.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between space-x-2">
                      <Label htmlFor="direct-messages" className="flex flex-col space-y-1">
                        <span>Direct Messages</span>
                        <span className="font-normal text-xs text-muted-foreground">
                          Get notified when you receive a direct message
                        </span>
                      </Label>
                      <input
                        type="checkbox"
                        id="direct-messages"
                        name="notifications"
                        className="toggle"
                        checked={formData.notifications}
                        onChange={handleChange}
                      />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between space-x-2">
                      <Label htmlFor="group-messages" className="flex flex-col space-y-1">
                        <span>Group Chats</span>
                        <span className="font-normal text-xs text-muted-foreground">
                          Get notified about activity in group chats
                        </span>
                      </Label>
                      <input
                        type="checkbox"
                        id="group-messages"
                        className="toggle"
                        checked={formData.notifications}
                        onChange={handleChange}
                      />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between space-x-2">
                      <Label htmlFor="mentions" className="flex flex-col space-y-1">
                        <span>Mentions</span>
                        <span className="font-normal text-xs text-muted-foreground">
                          Get notified when you're mentioned
                        </span>
                      </Label>
                      <input
                        type="checkbox"
                        id="mentions"
                        className="toggle"
                        checked={formData.notifications}
                        onChange={handleChange}
                      />
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button>Save Preferences</Button>
                  </CardFooter>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
