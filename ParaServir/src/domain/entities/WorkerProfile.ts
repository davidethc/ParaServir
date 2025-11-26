import { UUIDv4 } from '../valueObjects/UUIDv4';

export type VerificationStatus = 'pending' | 'approved' | 'rejected';

export class WorkerProfile {
  public readonly id: UUIDv4;
  public readonly userId: UUIDv4;
  public readonly yearsExperience: number;
  public readonly certificationUrl: string | null;
  public readonly verificationStatus: VerificationStatus;
  public readonly isActive: boolean;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;

  private constructor(
    id: UUIDv4,
    userId: UUIDv4,
    yearsExperience: number,
    certificationUrl: string | null,
    verificationStatus: VerificationStatus,
    isActive: boolean,
    createdAt: Date,
    updatedAt: Date
  ) {
    this.id = id;
    this.userId = userId;
    this.yearsExperience = yearsExperience;
    this.certificationUrl = certificationUrl;
    this.verificationStatus = verificationStatus;
    this.isActive = isActive;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  static create(
    id: UUIDv4,
    userId: UUIDv4,
    yearsExperience: number = 0,
    certificationUrl: string | null = null,
    verificationStatus: VerificationStatus = 'pending',
    isActive: boolean = true,
    createdAt: Date = new Date(),
    updatedAt: Date = new Date()
  ): WorkerProfile {
    return new WorkerProfile(id, userId, yearsExperience, certificationUrl, verificationStatus, isActive, createdAt, updatedAt);
  }

  static fromPersistence(data: {
    id: string;
    user_id: string;
    years_experience: number;
    certification_url: string | null;
    verification_status: string;
    is_active: boolean;
    created_at: Date;
    updated_at: Date;
  }): WorkerProfile {
    return new WorkerProfile(
      new UUIDv4(data.id),
      new UUIDv4(data.user_id),
      data.years_experience,
      data.certification_url,
      data.verification_status as VerificationStatus,
      data.is_active,
      new Date(data.created_at),
      new Date(data.updated_at)
    );
  }

  toPersistence(): {
    id: string;
    user_id: string;
    years_experience: number;
    certification_url: string | null;
    verification_status: string;
    is_active: boolean;
    created_at: Date;
    updated_at: Date;
  } {
    return {
      id: this.id.getValue(),
      user_id: this.userId.getValue(),
      years_experience: this.yearsExperience,
      certification_url: this.certificationUrl,
      verification_status: this.verificationStatus,
      is_active: this.isActive,
      created_at: this.createdAt,
      updated_at: this.updatedAt,
    };
  }
}

