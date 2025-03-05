import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/auth-context";
import ChatSidebar from "@/components/ChatSidebar";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, User, Shield, Bell, LogOut, KeyRound, Trash, Save, Loader2, Camera, Check, Palette } from "lucide-react";
import { useTheme } from "@/components/theme-provider";

// Default avatar options
const AVATAR_OPTIONS = [
  "https://images.unsplash.com/photo-1649972904349-6e44c42644a7",
  "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158",
  "https://images.unsplash.com/photo-1581092795360-fd1ca04f0952",
  "https://images.unsplash.com/photo-1535268647677-300dbf3d78d1",
  "https://images.unsplash.com/photo-1582562124811-c09040d0a901"
];

export default function Profile() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, logout, updateProfile, updateAvatar } = useAuth();
  const { theme, setTheme } = useTheme();
  
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [showAvatarDialog, setShowAvatarDialog] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState(null);
  const [customAvatarUrl, setCustomAvatarUrl] = useState("");
  const [isAvatarLoading, setIsAvatarLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    username: user?.username || "",
    email: user?.email || "",
    bio: user?.bio || "Product designer and developer based in Stockholm.",
    notificationSettings: {
      directMessages: true,
      groupChats: true,
      mentions: true
    }
  });

  // Update form data when user changes
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        username: user.username,
        email: user.email,
        bio: user.bio || prev.bio
      }));
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNotificationChange = (key, checked) => {
    setFormData(prev => ({
      ...prev,
      notificationSettings: {
        ...prev.notificationSettings,
        [key]: checked
      }
    }));
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      // Update user profile
      await updateProfile({
        username: formData.username,
        bio: formData.bio // Add bio to the update
      });
      
      setIsEditing(false);
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated",
      });
    } catch (error) {
      console.error("Profile update error:", error);
      toast({
        variant: "destructive",
        title: "Update failed",
        description: "There was an error updating your profile",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveNotifications = async () => {
    setIsSaving(true);
    try {
      // In a real app, we would save notification preferences to the server
      // For this demo, we'll just show a success message
      await new Promise(resolve => setTimeout(resolve, 500));
      
      toast({
        title: "Preferences saved",
        description: "Your notification preferences have been updated",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Update failed",
        description: "There was an error updating your preferences",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarChange = async () => {
    if (!selectedAvatar && !customAvatarUrl) {
      toast({
        variant: "destructive",
        title: "No avatar selected",
        description: "Please select an avatar or enter a custom URL",
      });
      return;
    }

    setIsAvatarLoading(true);
    try {
      const newAvatar = customAvatarUrl || selectedAvatar || user?.avatar;
      if (newAvatar) {
        await updateAvatar(newAvatar);
        toast({
          title: "Avatar updated",
          description: "Your profile picture has been updated"
        });
        setShowAvatarDialog(false);
      }
    } catch (error) {
      console.error("Avatar update error:", error);
      toast({
        variant: "destructive",
        title: "Update failed",
        description: "There was an error updating your avatar",
      });
    } finally {
      setIsAvatarLoading(false);
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

  const handleDeleteAccount = () => {
    // In a real app, this would make an API call to delete the account
    logout();
    navigate("/login");
    toast({
      title: "Account deleted",
      description: "Your account has been permanently deleted",
    });
  };

  if (!user) return null;

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
              <TabsList className="grid grid-cols-4 w-full max-w-md mb-8">
                <TabsTrigger value="account">
                  <User className="h-4 w-4 mr-2" /> Account
                </TabsTrigger>
                <TabsTrigger value="security">
                  <Shield className="h-4 w-4 mr-2" /> Security
                </TabsTrigger>
                <TabsTrigger value="notifications">
                  <Bell className="h-4 w-4 mr-2" /> Notifications
                </TabsTrigger>
                <TabsTrigger value="appearance">
                  <Palette className="h-4 w-4 mr-2" /> Appearance
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
                      <div className="relative group cursor-pointer" onClick={() => isEditing && setShowAvatarDialog(true)}>
                        <Avatar className="h-20 w-20">
                          <AvatarImage src={user.avatar} alt={user.username} />
                          <AvatarFallback>{user.username.charAt(0)}</AvatarFallback>
                        </Avatar>
                        {isEditing && (
                          <div className="absolute inset-0 bg-black/30 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Camera className="h-5 w-5 text-white" />
                          </div>
                        )}
                      </div>
                      <div className="space-y-1.5">
                        <h3 className="font-medium">{user.username}</h3>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                        {isEditing && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setShowAvatarDialog(true)}
                          >
                            Change Avatar
                          </Button>
                        )}
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
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Saving...
                            </>
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
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => setShowDeleteAlert(true)}
                      >
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
                      <Switch
                        id="direct-messages"
                        checked={formData.notificationSettings.directMessages}
                        onCheckedChange={(checked) => 
                          handleNotificationChange('directMessages', checked)
                        }
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
                      <Switch
                        id="group-messages"
                        checked={formData.notificationSettings.groupChats}
                        onCheckedChange={(checked) => 
                          handleNotificationChange('groupChats', checked)
                        }
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
                      <Switch
                        id="mentions"
                        checked={formData.notificationSettings.mentions}
                        onCheckedChange={(checked) => 
                          handleNotificationChange('mentions', checked)
                        }
                      />
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button onClick={handleSaveNotifications} disabled={isSaving}>
                      {isSaving ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        "Save Preferences"
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>

              <TabsContent value="appearance" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Appearance</CardTitle>
                    <CardDescription>
                      Customize the look and feel of the application
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-4">
                      <h3 className="text-sm font-medium">Theme</h3>
                      <div className="grid grid-cols-3 gap-4">
                        <div 
                          className={`flex flex-col items-center justify-center p-4 rounded-lg border border-border/50 cursor-pointer ${theme === 'light' ? 'bg-primary/10' : ''}`}
                          onClick={() => setTheme('light')}
                        >
                          <div className="h-12 w-12 rounded-full bg-background border border-border flex items-center justify-center mb-2">
                            <div className="h-6 w-6 bg-primary rounded-full" />
                          </div>
                          <span className="text-sm">Light</span>
                          {theme === 'light' && (
                            <div className="absolute top-2 right-2">
                              <Check className="h-4 w-4 text-primary" />
                            </div>
                          )}
                        </div>
                        <div 
                          className={`flex flex-col items-center justify-center p-4 rounded-lg border border-border/50 cursor-pointer ${theme === 'dark' ? 'bg-primary/10' : ''}`}
                          onClick={() => setTheme('dark')}
                        >
                          <div className="h-12 w-12 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center mb-2">
                            <div className="h-6 w-6 bg-primary rounded-full" />
                          </div>
                          <span className="text-sm">Dark</span>
                          {theme === 'dark' && (
                            <div className="absolute top-2 right-2">
                              <Check className="h-4 w-4 text-primary" />
                            </div>
                          )}
                        </div>
                        <div 
                          className={`flex flex-col items-center justify-center p-4 rounded-lg border border-border/50 cursor-pointer ${theme === 'system' ? 'bg-primary/10' : ''}`}
                          onClick={() => setTheme('system')}
                        >
                          <div className="h-12 w-12 rounded-full bg-gradient-to-r from-background to-zinc-800 border border-border flex items-center justify-center mb-2">
                            <div className="h-6 w-6 bg-primary rounded-full" />
                          </div>
                          <span className="text-sm">System</span>
                          {theme === 'system' && (
                            <div className="absolute top-2 right-2">
                              <Check className="h-4 w-4 text-primary" />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      {/* Delete Account Alert Dialog */}
      <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Account</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete your account and all associated data.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteAccount} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Avatar Change Dialog */}
      <Dialog open={showAvatarDialog} onOpenChange={setShowAvatarDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Change Avatar</DialogTitle>
            <DialogDescription>
              Choose from our gallery or enter a custom URL.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <Label>Choose an avatar</Label>
            <div className="grid grid-cols-3 gap-4">
              {AVATAR_OPTIONS.map((url) => (
                <div 
                  key={url} 
                  className={`relative rounded-lg overflow-hidden cursor-pointer border-2 ${
                    selectedAvatar === url ? "border-primary" : "border-transparent"
                  }`}
                  onClick={() => {
                    setSelectedAvatar(url);
                    setCustomAvatarUrl("");
                  }}
                >
                  <img src={url} alt="Avatar option" className="w-full h-auto aspect-square object-cover" />
                  {selectedAvatar === url && (
                    <div className="absolute top-1 right-1 bg-primary rounded-full p-0.5">
                      <Check className="h-3 w-3 text-primary-foreground" />
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            <div className="grid gap-2 mt-2">
              <Label htmlFor="custom-url">Or enter a custom URL</Label>
              <Input
                id="custom-url"
                placeholder="https://example.com/avatar.jpg"
                value={customAvatarUrl}
                onChange={(e) => {
                  setCustomAvatarUrl(e.target.value);
                  setSelectedAvatar(null);
                }}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAvatarDialog(false)} disabled={isAvatarLoading}>
              Cancel
            </Button>
            <Button onClick={handleAvatarChange} disabled={isAvatarLoading}>
              {isAvatarLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
