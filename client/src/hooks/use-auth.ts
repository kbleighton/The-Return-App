import { useUser, useClerk } from "@clerk/clerk-react";
import { useQuery } from "@tanstack/react-query";
import type { User } from "@shared/models/auth";

async function fetchUser(): Promise<User | null> {
  const response = await fetch("/api/auth/user", {
    credentials: "include",
  });

  if (response.status === 401) {
    return null;
  }

  if (!response.ok) {
    throw new Error(`${response.status}: ${response.statusText}`);
  }

  return response.json();
}

export function useAuth() {
  const { isLoaded, isSignedIn, user: clerkUser } = useUser();
  const { signOut } = useClerk();

  // Fetch our database user record
  const { data: user, isLoading: isLoadingUser } = useQuery<User | null>({
    queryKey: ["/api/auth/user"],
    queryFn: fetchUser,
    enabled: isSignedIn,
    retry: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const isLoading = !isLoaded || (isSignedIn && isLoadingUser);

  return {
    user,
    isLoading,
    isAuthenticated: isSignedIn && !!user,
    logout: () => signOut(),
    isLoggingOut: false,
  };
}
