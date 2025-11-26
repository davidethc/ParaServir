import { Profile } from '../entities/Profile';
import { UUIDv4 } from '../valueObjects/UUIDv4';

export interface ProfileRepository {
  create(profileData: {
    user_id: string;
    first_name: string;
    last_name: string;
    cedula: string;
    phone?: string | null;
    location?: string | null;
    avatar_url?: string | null;
  }): Promise<Profile>;
  findById(id: string): Promise<Profile | null>;
  findByUserId(userId: string): Promise<Profile | null>;
  update(profile: Profile): Promise<Profile>;
  delete(id: string): Promise<void>;
}

