import { WorkerProfile } from "../../Domain/WorkerProfile";
import { WorkerService } from "../../Domain/WorkerService";
import type { WorkerRepository } from "../../Domain/WorkerRepository";

export class InMemoryWorkerRepository implements WorkerRepository {
  private profiles: WorkerProfile[] = [];
  private services: WorkerService[] = [];

  async createProfile(profile: WorkerProfile): Promise<void> {
    this.profiles.push(profile);
  }

  async findProfileById(id: string): Promise<WorkerProfile | null> {
    return this.profiles.find((p) => p.id.value === id) || null;
  }

  async findProfileByUserId(userId: string): Promise<WorkerProfile | null> {
    return this.profiles.find((p) => p.userId.value === userId) || null;
  }

  async updateProfile(profile: WorkerProfile): Promise<void> {
    const index = this.profiles.findIndex((p) => p.id.value === profile.id.value);
    if (index !== -1) {
      this.profiles[index] = profile;
    }
  }

  async deleteProfile(id: string): Promise<void> {
    this.profiles = this.profiles.filter((p) => p.id.value !== id);
  }

  async createService(service: WorkerService): Promise<void> {
    this.services.push(service);
  }

  async findServiceById(id: string): Promise<WorkerService | null> {
    return this.services.find((s) => s.id === id) || null;
  }

  async findServicesByWorkerId(workerId: string): Promise<WorkerService[]> {
    return this.services.filter((s) => s.workerId.value === workerId);
  }

  async updateService(service: WorkerService): Promise<void> {
    const index = this.services.findIndex((s) => s.id === service.id);
    if (index !== -1) {
      this.services[index] = service;
    }
  }

  async deleteService(id: string): Promise<void> {
    this.services = this.services.filter((s) => s.id !== id);
  }
}

