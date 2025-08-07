import { useSession } from "next-auth/react";

// Extend the user type to include id
type UserWithId = {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  tokenBalance?: number;
};

export function useUser() {
  const { data: session, status } = useSession();
  // If session.user exists, ensure it has id
  // Type assertion to allow id property, since NextAuth session.user is extended at runtime
  const user = session?.user && typeof (session.user as any).id === 'string'
    ? (session.user as UserWithId)
    : null;
  return {
    user,
    loading: status === "loading",
    authenticated: !!user,
  };
}
