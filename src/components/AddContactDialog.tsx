
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
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/auth-context";
import { Loader2, Plus, UserPlus } from "lucide-react";

interface AddContactDialogProps {
  onContactAdded?: () => void;
  trigger?: React.ReactNode;
}

export default function AddContactDialog({ onContactAdded, trigger }: AddContactDialogProps) {
  const { toast } = useToast();
  const { addContact } = useAuth();
  
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  const handleAddContact = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    
    try {
      // Validate email format (simple validation)
      if (!email.includes('@') || email.trim().length < 5) {
        throw new Error("Please enter a valid email address");
      }
      
      // Add contact
      await addContact(email);
      
      toast({
        title: "Contact added",
        description: "Contact has been added to your friends list",
      });
      
      setEmail("");
      setOpen(false);
      
      if (onContactAdded) {
        onContactAdded();
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to add contact";
      setError(errorMessage);
      
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const defaultTrigger = (
    <Button variant="outline" className="w-full h-auto p-4 flex flex-col items-center justify-center space-y-2 border-dashed">
      <UserPlus className="h-6 w-6 text-muted-foreground" />
      <span className="text-sm font-normal text-muted-foreground">Add New Contact</span>
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleAddContact}>
          <DialogHeader>
            <DialogTitle>Add New Contact</DialogTitle>
            <DialogDescription>
              Enter the email address of the person you want to add.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="friend@example.com"
                className={error ? "border-destructive" : ""}
                disabled={isLoading}
                required
              />
              {error && (
                <p className="text-xs text-destructive">{error}</p>
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
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Contact
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
