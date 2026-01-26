/**
 * DTOs para el módulo de Favoritos
 */

export interface FavoriteDto {
  id: string;
  worker_id: string;
  created_at: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  location: string | null;
  avatar_url: string | null;
  latitude: number | null;
  longitude: number | null;
  years_experience: number | null;
  verification_status: 'pending' | 'verified' | 'rejected';
  is_active: boolean;
}

export interface FavoritesResponse {
  status: string;
  favorites: FavoriteDto[];
  count: number;
}

export interface IsFavoriteResponse {
  status: string;
  is_favorite: boolean;
  favorite_id: string | null;
}

export interface FavoriteActionResponse {
  status: string;
  message: string;
  favorite?: FavoriteDto;
}
