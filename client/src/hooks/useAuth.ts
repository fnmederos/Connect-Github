import { useQuery } from "@tanstack/react-query";
import type { User } from "@shared/schema";

interface AuthStatusResponse {
  authenticated: boolean;
  user: User | null;
}

export function useAuth() {
  const { data, isLoading, error } = useQuery<AuthStatusResponse>({
    queryKey: ['/api/auth/status'],
    retry: false,
  });

  const user = data?.user || null;
  const isAuthenticated = data?.authenticated || false;
  const isApproved = user?.isApproved || false;
  const isAdmin = user?.role === 'admin';

  return {
    user,
    isLoading,
    isAuthenticated,
    isApproved,
    isAdmin,
    error,
  };
}
