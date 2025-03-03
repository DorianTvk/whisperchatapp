
import { Navigate, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/auth-context";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";

export default function ProtectedRoute({ children }: { children: JSX.Element }) {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // If not loading and authenticated, ensure we stay on the protected route
    if (!isLoading && isAuthenticated) {
      console.log("User is authenticated, rendering protected content");
    }
    // If not loading and not authenticated, redirect to login
    else if (!isLoading && !isAuthenticated) {
      console.log("User is not authenticated, redirecting to login");
      navigate("/login", { replace: true, state: { from: location } });
    }
  }, [isAuthenticated, isLoading, navigate, location]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    console.log("Redirecting unauthenticated user to login");
    return <Navigate to="/login" replace />;
  }

  return children;
}
