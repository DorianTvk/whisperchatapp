
import { Navigate, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/auth-context";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";

export default function ProtectedRoute({ children }: { children: JSX.Element }) {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  console.log("ProtectedRoute - isAuthenticated:", isAuthenticated, "isLoading:", isLoading);

  // Use an effect with immediate check to improve performance
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      console.log("User not authenticated, redirecting to login");
      navigate("/login", { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Immediate return for unauthenticated users
  if (!isAuthenticated) {
    console.log("Immediate redirect for unauthenticated user");
    return <Navigate to="/login" replace />;
  }

  // Only render children if authenticated
  return children;
}
