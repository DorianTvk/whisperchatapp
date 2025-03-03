
import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/auth-context";
import { Loader2 } from "lucide-react";

export default function ProtectedRoute({ children }: { children: JSX.Element }) {
  const { isAuthenticated, isLoading } = useAuth();

  console.log("ProtectedRoute - isAuthenticated:", isAuthenticated, "isLoading:", isLoading);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Simple redirect for unauthenticated users
  if (!isAuthenticated) {
    console.log("User not authenticated, redirecting to login");
    return <Navigate to="/login" replace />;
  }

  // Only render children if authenticated
  return children;
}
