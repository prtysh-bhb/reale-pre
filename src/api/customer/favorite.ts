import api from "@/api/axios"; // your axios instance with baseURL

// Get user's favorites
export const getFavorites = async () => {
  return await api.get("/favorites");
};

// Add to favorites
export const addFavorite = async (propertyId: number) => {
  return await api.post(`/favorites/${propertyId}`);
};

// Remove from favorites
export const removeFavorite = async (propertyId: number) => {
  return await api.delete(`/favorites/${propertyId}`);
};

// Check if a property is favorited
export const checkFavorite = async (propertyId: number) => {
  return await api.get(`/favorites/check/${propertyId}`);
};
