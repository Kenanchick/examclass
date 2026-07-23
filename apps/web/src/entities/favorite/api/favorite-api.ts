import { apiClient } from "@/shared/api/http-client";
import type { Task } from "@/entities/task/model/task";

export async function getFavorites() {
  const response = await apiClient.get<Task[]>("/favorites");

  return response.data;
}

export async function addFavorite(publicId: string) {
  await apiClient.put(`/favorites/${encodeURIComponent(publicId)}`);
}

export async function removeFavorite(publicId: string) {
  await apiClient.delete(`/favorites/${encodeURIComponent(publicId)}`);
}
