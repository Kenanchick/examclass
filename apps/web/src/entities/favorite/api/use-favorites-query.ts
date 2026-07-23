import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { addFavorite, getFavorites, removeFavorite } from "./favorite-api";

export const favoritesQueryKey = ["favorites"] as const;

export function useFavoritesQuery(enabled: boolean) {
  return useQuery({
    queryKey: favoritesQueryKey,
    queryFn: getFavorites,
    enabled,
  });
}

export function useFavoriteMutations() {
  const queryClient = useQueryClient();
  const invalidateFavorites = () =>
    queryClient.invalidateQueries({ queryKey: favoritesQueryKey });

  const addMutation = useMutation({
    mutationFn: addFavorite,
    onSuccess: invalidateFavorites,
  });
  const removeMutation = useMutation({
    mutationFn: removeFavorite,
    onSuccess: invalidateFavorites,
  });

  return { addMutation, removeMutation };
}
