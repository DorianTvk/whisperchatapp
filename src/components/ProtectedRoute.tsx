
import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/auth-context";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

export default function ProtectedRoute({ children }: { children: JSX.Element }) {
  const { isAuthenticated, isLoading } = useAuth();
  const [showLoader, setShowLoader] = useState(false);
  
  // Only show loader after a short delay to avoid flash for quick loads
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    
    if (isLoading) {
      timeout = setTimeout(() => {
        setShowLoader(true);
      }, 500); // Increase delay before showing loader
    } else {
      setShowLoader(false);
    }
    
    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [isLoading]);

  // Immediate redirect for unauthenticated users
  if (!isLoading && !isAuthenticated) {
    console.log("Not authenticated, redirecting to login");
    return <Navigate to="/login" replace />;
  }

  // Only show loader after delay to prevent unnecessary flashing
  if (isLoading && showLoader) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-2" />
          <span className="text-muted-foreground">Loading your profile...</span>
        </div>
      </div>
    );
  }
  
  // Don't render anything during short loading periods
  if (isLoading) {
    return null;
  }

  // Only render children if authenticated
  return children;
}
