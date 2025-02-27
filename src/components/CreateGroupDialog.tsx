
import { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/auth-context";
import { Loader2, Plus, Users } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface CreateGroupDialogProps {
  onGroupCreated?: () => void;
  trigger?: React.ReactNode;
}

export default function CreateGroupDialog({ onGroupCreated, trigger }: CreateGroupDialogProps) {
  const { toast } = useToast();
  const { contacts, createGroup } = useAuth();
  
  const [name, setName] = useState("");
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    
    try {
      if (name.trim().length < 3) {
        throw new Error("Group name must be at least 3 characters");
      }
      
      if (selectedContacts.length === 0) {
        throw new Error("Please select at least one contact");
      }
      
      // Create group
      await createGroup(name, selectedContacts);
      
      toast({
        title: "Group created",
        description: "Your new group has been created successfully",
      });
      
      setName("");
      setSelectedContacts([]);
      setOpen(false);
      
      if (onGroupCreated) {
        onGroupCreated();
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to create group");
      
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create group",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleContact = (contactId: string) => {
    setSelectedContacts((prev) => 
      prev.includes(contactId) 
        ? prev.filter(id => id !== contactId) 
        : [...prev, contactId]
    );
  };

  const defaultTrigger = (
    <Button variant="outline" className="w-full h-auto p-4 flex flex-col items-center justify-center space-y-2 border-dashed">
      <Plus className="h-6 w-6 text-muted-foreground" />
      <span className="text-sm font-normal text-muted-foreground">Create New Group</span>
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleCreateGroup}>
          <DialogHeader>
            <DialogTitle>Create New Group</DialogTitle>
            <DialogDescription>
              Create a new group and add members.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Group Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Project Team"
                className={error && !name ? "border-destructive" : ""}
                disabled={isLoading}
                required
              />
            </div>
            
            <div className="grid gap-2">
              <Label>Select Members</Label>
              {contacts.length === 0 ? (
                <p className="text-sm text-muted-foreground">You have no contacts yet.</p>
              ) : (
                <ScrollArea className="h-[200px] rounded-md border">
                  <div className="p-4 space-y-3">
                    {contacts.map((contact) => (
                      <div key={contact.id} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`contact-${contact.id}`} 
                          checked={selectedContacts.includes(contact.id)}
                          onCheckedChange={() => toggleContact(contact.id)}
                          disabled={isLoading}
                        />
                        <label
                          htmlFor={`contact-${contact.id}`}
                          className="flex items-center space-x-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                        >
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={contact.avatar} alt={contact.name} />
                            <AvatarFallback>{contact.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <span>{contact.name}</span>
                        </label>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
              {error && selectedContacts.length === 0 && (
                <p className="text-xs text-destructive">Please select at least one contact</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setOpen(false)} 
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || contacts.length === 0}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Users className="mr-2 h-4 w-4" />
                  Create Group
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
