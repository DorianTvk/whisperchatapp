
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserStatus, useAuth } from "@/context/auth-context";
import { Circle, CheckCircle2, Clock, XCircle, BellOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface StatusChangerProps {
  trigger: React.ReactNode;
}

export default function StatusChanger({ trigger }: StatusChangerProps) {
  const { user, updateStatus } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [customStatusOpen, setCustomStatusOpen] = useState(false);
  const [customStatus, setCustomStatus] = useState(user?.statusMessage || "");
  const [selectedStatus, setSelectedStatus] = useState<UserStatus>(user?.status || "online");
  const [isLoading, setIsLoading] = useState(false);

  const statuses = [
    { label: "Online", value: "online", icon: Circle, color: "text-green-500" },
    { label: "Away", value: "away", icon: Clock, color: "text-amber-500" },
    { label: "Busy", value: "busy", icon: XCircle, color: "text-red-500" },
    { label: "Offline", value: "offline", icon: BellOff, color: "text-gray-500" },
  ];

  const handleSelectStatus = async (status: UserStatus) => {
    setSelectedStatus(status);
    
    try {
      setIsLoading(true);
      await updateStatus(status);
      toast({
        title: "Status updated",
        description: `Your status is now ${status}`,
      });
      setOpen(false);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update status",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenCustomStatus = () => {
    setCustomStatusOpen(true);
  };

  const handleSaveCustomStatus = async () => {
    try {
      setIsLoading(true);
      await updateStatus(selectedStatus, customStatus);
      toast({
        title: "Status updated",
        description: "Your custom status has been set",
      });
      setCustomStatusOpen(false);
      setOpen(false);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update status",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          {trigger}
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <div className="px-2 py-1.5">
            <p className="text-xs font-medium text-muted-foreground">Set your status</p>
          </div>
          {statuses.map((status) => (
            <DropdownMenuItem 
              key={status.value} 
              onClick={() => handleSelectStatus(status.value as UserStatus)}
              disabled={isLoading}
            >
              <status.icon className={`mr-2 h-4 w-4 ${status.color}`} />
              <span className="flex-1">{status.label}</span>
              {user?.status === status.value && (
                <CheckCircle2 className="ml-2 h-4 w-4 text-primary" />
              )}
            </DropdownMenuItem>
          ))}
          <DropdownMenuItem 
            onClick={handleOpenCustomStatus}
            disabled={isLoading}
          >
            <Circle className="mr-2 h-4 w-4 text-primary" />
            <span className="flex-1">Custom Status</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={customStatusOpen} onOpenChange={setCustomStatusOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Set a custom status</DialogTitle>
            <DialogDescription>
              Let others know what you're up to or when you'll be back.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="status">Status Message</Label>
              <Input
                id="status"
                placeholder="What's happening?"
                value={customStatus}
                onChange={(e) => setCustomStatus(e.target.value)}
                maxLength={40}
              />
              <p className="text-xs text-muted-foreground text-right">
                {customStatus.length}/40
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setCustomStatusOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveCustomStatus} disabled={isLoading}>
              Save Status
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
