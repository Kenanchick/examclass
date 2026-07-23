import { useQuery } from "@tanstack/react-query";
import { getCurrentUser } from "@/shared/api/auth";

export const currentUserQueryKey = ["current-user"] as const;

export function useCurrentUserQuery(enabled: boolean) {
  return useQuery({
    queryKey: currentUserQueryKey,
    queryFn: getCurrentUser,
    enabled,
  });
}
