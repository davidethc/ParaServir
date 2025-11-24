import { Pool } from "pg";
import { WorkerProfile } from "../../Domain/WorkerProfile";
import { WorkerService } from "../../Domain/WorkerService";
import type { WorkerRepository } from "../../Domain/WorkerRepository";
import { WorkerId } from "../../Domain/WorkerId";
import { UserId } from "../../Domain/UserId";
import { ServiceDescription } from "../../Domain/ServiceDescription";
import { YearsExperience } from "../../Domain/YearsExperience";
import { WorkerCreatedAt } from "../../Domain/WorkerCreatedAt";
import { CategoryId } from "../../Domain/CategoryId";
import { ServiceTitle } from "../../Domain/ServiceTitle";
import { ServicePrice } from "../../Domain/ServicePrice";

type PostgresWorkerProfile = {
  id: string;
  user_id: string;
  service_description: string;
  years_experience: number;
  certification_url: string | null;
  is_active: boolean;
  verification_status: string;
  created_at: Date;
  updated_at: Date;
};

type PostgresWorkerService = {
  id: string;
  worker_id: string;
  category_id: string;
  title: string;
  description: string;
  base_price: number;
  is_available: boolean;
  created_at: Date;
  updated_at: Date;
};

export class PostgresWorkerRepository implements WorkerRepository {
  client: Pool;

  constructor(databaseUrl: string) {
    this.client = new Pool({
      connectionString: databaseUrl,
    });
  }

  // WorkerProfile methods
  async createProfile(profile: WorkerProfile): Promise<void> {
    const query = {
      text: `INSERT INTO worker_profiles 
             (id, user_id, service_description, years_experience, certification_url, is_active, verification_status, created_at, updated_at) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      values: [
        profile.id.value,
        profile.userId.value,
        profile.serviceDescription.value,
        profile.yearsExperience.value,
        profile.certificationUrl || null,
        profile.isActive,
        profile.verificationStatus,
        profile.createdAt.value,
        profile.updatedAt,
      ],
    };

    await this.client.query(query);
  }

  async findProfileById(id: string): Promise<WorkerProfile | null> {
    const query = {
      text: "SELECT * FROM worker_profiles WHERE id = $1",
      values: [id],
    };

    const result = await this.client.query<PostgresWorkerProfile>(query);

    if (result.rows.length === 0) {
      return null;
    }

    return this.mapProfileToDomain(result.rows[0]);
  }

  async findProfileByUserId(userId: string): Promise<WorkerProfile | null> {
    const query = {
      text: "SELECT * FROM worker_profiles WHERE user_id = $1",
      values: [userId],
    };

    const result = await this.client.query<PostgresWorkerProfile>(query);

    if (result.rows.length === 0) {
      return null;
    }

    return this.mapProfileToDomain(result.rows[0]);
  }

  async updateProfile(profile: WorkerProfile): Promise<void> {
    const query = {
      text: `UPDATE worker_profiles 
             SET service_description = $1, years_experience = $2, certification_url = $3, 
                 is_active = $4, verification_status = $5, updated_at = $6 
             WHERE id = $7`,
      values: [
        profile.serviceDescription.value,
        profile.yearsExperience.value,
        profile.certificationUrl || null,
        profile.isActive,
        profile.verificationStatus,
        new Date(),
        profile.id.value,
      ],
    };

    await this.client.query(query);
  }

  async deleteProfile(id: string): Promise<void> {
    const query = {
      text: "DELETE FROM worker_profiles WHERE id = $1",
      values: [id],
    };

    await this.client.query(query);
  }

  // WorkerService methods
  async createService(service: WorkerService): Promise<void> {
    const query = {
      text: `INSERT INTO worker_services 
             (id, worker_id, category_id, title, description, base_price, is_available, created_at, updated_at) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      values: [
        service.id,
        service.workerId.value,
        service.categoryId.value,
        service.title.value,
        service.description,
        service.basePrice.value,
        service.isAvailable,
        service.createdAt.value,
        service.updatedAt,
      ],
    };

    await this.client.query(query);
  }

  async findServiceById(id: string): Promise<WorkerService | null> {
    const query = {
      text: "SELECT * FROM worker_services WHERE id = $1",
      values: [id],
    };

    const result = await this.client.query<PostgresWorkerService>(query);

    if (result.rows.length === 0) {
      return null;
    }

    return this.mapServiceToDomain(result.rows[0]);
  }

  async findServicesByWorkerId(workerId: string): Promise<WorkerService[]> {
    const query = {
      text: "SELECT * FROM worker_services WHERE worker_id = $1",
      values: [workerId],
    };

    const result = await this.client.query<PostgresWorkerService>(query);

    return result.rows.map((row) => this.mapServiceToDomain(row));
  }

  async updateService(service: WorkerService): Promise<void> {
    const query = {
      text: `UPDATE worker_services 
             SET title = $1, description = $2, base_price = $3, is_available = $4, updated_at = $5 
             WHERE id = $6`,
      values: [
        service.title.value,
        service.description,
        service.basePrice.value,
        service.isAvailable,
        new Date(),
        service.id,
      ],
    };

    await this.client.query(query);
  }

  async deleteService(id: string): Promise<void> {
    const query = {
      text: "DELETE FROM worker_services WHERE id = $1",
      values: [id],
    };

    await this.client.query(query);
  }

  // Mappers
  private mapProfileToDomain(row: PostgresWorkerProfile): WorkerProfile {
    return new WorkerProfile(
      new WorkerId(row.id),
      new UserId(row.user_id),
      new ServiceDescription(row.service_description),
      new YearsExperience(row.years_experience),
      row.certification_url || undefined,
      row.is_active,
      row.verification_status as 'pending' | 'approved' | 'rejected',
      new WorkerCreatedAt(row.created_at)
    );
  }

  private mapServiceToDomain(row: PostgresWorkerService): WorkerService {
    return new WorkerService(
      row.id,
      new WorkerId(row.worker_id),
      new CategoryId(row.category_id),
      new ServiceTitle(row.title),
      row.description,
      new ServicePrice(Number(row.base_price)),
      row.is_available,
      new WorkerCreatedAt(row.created_at)
    );
  }
}

