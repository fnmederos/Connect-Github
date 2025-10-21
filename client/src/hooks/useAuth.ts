import { useQuery } from "@tanstack/react-query";

interface UserInfo {
  id: string;
  username: string;
  email: string;
  role: string;
  isApproved: boolean;
}

export function useAuth() {
  const { data: user, isLoading, error } = useQuery<UserInfo>({
    queryKey: ['/api/me'],
    retry: false,
    // This query will fail with 401 if not authenticated, which is expected
    throwOnError: false,
  });

  const isAuthenticated = !!user;
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
