import type { Profile } from "../Domain/Profile";

export interface ProfileRepository {
  create(profile: Profile): Promise<void>;
  findById(id: string): Promise<Profile | null>;
  findByUserId(userId: string): Promise<Profile | null>;
  findAll(): Promise<Profile[]>;
  update(profile: Profile): Promise<void>;
  delete(id: string): Promise<void>;
}



