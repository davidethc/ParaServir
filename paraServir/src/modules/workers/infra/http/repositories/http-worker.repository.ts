import type { WorkerRepository } from "../../../Domain/repositories/WorkerRepository";
import { Worker } from "../../../Domain/entities/Worker";
import { WorkerId } from "../../../Domain/value-objects/WorkerId";
import { WorkerUserId } from "../../../Domain/value-objects/WorkerUserId";
import { WorkerVerificationStatus } from "../../../Domain/value-objects/WorkerVerificationStatus";
import { WorkerCreatedAt } from "../../../Domain/value-objects/WorkerCreatedAt";
import { API_CONFIG } from "../api.config";

/**
 * Implementación del repositorio de workers que se conecta al backend remoto vía HTTP
 * Basado en el esquema SQL: worker_profiles (id, user_id, years_experience, certification_url, verification_status, is_active, created_at, updated_at)
 */
export class HttpWorkerRepository implements WorkerRepository {
    private apiUrl: string;

    constructor(apiUrl?: string) {
        this.apiUrl = apiUrl || API_CONFIG.baseUrl;
    }

    async create(worker: Worker): Promise<void> {
        try {
            const response = await fetch(`${this.apiUrl}${API_CONFIG.endpoints.workers}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: worker.userId.stringValue,
                    years_experience: worker.yearsExperience,
                    certification_url: worker.certificationUrl,
                    verification_status: worker.verificationStatus.value,
                    is_active: worker.isActive,
                }),
            });

            if (!response.ok) {
                const error = await response.json().catch(() => ({ message: 'Failed to create worker' }));
                throw new Error(error.message || 'Failed to create worker');
            }
        } catch (error) {
            if (error instanceof Error) {
                throw error;
            }
            throw new Error('Failed to create worker');
        }
    }

    async findById(id: string): Promise<Worker | null> {
        try {
            const response = await fetch(`${this.apiUrl}${API_CONFIG.endpoints.workers}/${id}`);
            
            if (response.status === 404) {
                return null;
            }

            if (!response.ok) {
                const error = await response.json().catch(() => ({ message: 'Failed to find worker' }));
                throw new Error(error.message || 'Failed to find worker');
            }

            const data = await response.json();
            return this.mapToWorker(data);
        } catch (error) {
            if (error instanceof Error && error.message.includes('404')) {
                return null;
            }
            throw error;
        }
    }

    async findByUserId(userId: string): Promise<Worker | null> {
        try {
            const response = await fetch(`${this.apiUrl}${API_CONFIG.endpoints.workers}?user_id=${encodeURIComponent(userId)}`);
            
            if (response.status === 404) {
                return null;
            }

            if (!response.ok) {
                const error = await response.json().catch(() => ({ message: 'Failed to find worker' }));
                throw new Error(error.message || 'Failed to find worker');
            }

            const data = await response.json();
            // El backend puede devolver un objeto o un array
            const workerData = Array.isArray(data) ? data[0] : data;
            return workerData ? this.mapToWorker(workerData) : null;
        } catch (error) {
            if (error instanceof Error && error.message.includes('404')) {
                return null;
            }
            throw error;
        }
    }

    async findAll(): Promise<Worker[]> {
        const response = await fetch(`${this.apiUrl}${API_CONFIG.endpoints.workers}`);
        
        if (!response.ok) {
            const error = await response.json().catch(() => ({ message: 'Failed to fetch workers' }));
            throw new Error(error.message || 'Failed to fetch workers');
        }

        const data = await response.json();
        // El backend puede devolver un array o un objeto con data
        const workers = Array.isArray(data) ? data : (data.data || []);
        return workers.map((item: any) => this.mapToWorker(item)); // eslint-disable-line @typescript-eslint/no-explicit-any
    }

    async findActive(): Promise<Worker[]> {
        const response = await fetch(`${this.apiUrl}${API_CONFIG.endpoints.workers}?is_active=true`);
        
        if (!response.ok) {
            const error = await response.json().catch(() => ({ message: 'Failed to fetch active workers' }));
            throw new Error(error.message || 'Failed to fetch active workers');
        }

        const data = await response.json();
        const workers = Array.isArray(data) ? data : (data.data || []);
        return workers.map((item: any) => this.mapToWorker(item)); // eslint-disable-line @typescript-eslint/no-explicit-any
    }

    async update(worker: Worker): Promise<void> {
        const response = await fetch(`${this.apiUrl}${API_CONFIG.endpoints.workers}/${worker.id.value}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                years_experience: worker.yearsExperience,
                certification_url: worker.certificationUrl,
                verification_status: worker.verificationStatus.value,
                is_active: worker.isActive,
            }),
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ message: 'Failed to update worker' }));
            throw new Error(error.message || 'Failed to update worker');
        }
    }

    async delete(id: string): Promise<void> {
        const response = await fetch(`${this.apiUrl}${API_CONFIG.endpoints.workers}/${id}`, {
            method: 'DELETE',
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ message: 'Failed to delete worker' }));
            throw new Error(error.message || 'Failed to delete worker');
        }
    }

    /**
     * Mapea los datos del backend (snake_case) a la entidad Worker del dominio
     * El backend devuelve: id, user_id, years_experience, certification_url, verification_status, is_active, created_at, updated_at
     */
    private mapToWorker(data: any): Worker { // eslint-disable-line @typescript-eslint/no-explicit-any
        // Manejar tanto snake_case como camelCase del backend
        const id = data.id;
        const userId = data.user_id || data.userId;
        const yearsExperience = data.years_experience !== undefined ? data.years_experience : (data.yearsExperience || 0);
        const certificationUrl = data.certification_url || data.certificationUrl;
        const verificationStatus = data.verification_status || data.verificationStatus || 'pending';
        const isActive = data.is_active !== undefined ? data.is_active : (data.isActive !== false);
        const createdAt = data.created_at ? new Date(data.created_at) : (data.createdAt ? new Date(data.createdAt) : new Date());
        const updatedAt = data.updated_at ? new Date(data.updated_at) : (data.updatedAt ? new Date(data.updatedAt) : new Date());

        const worker = new Worker(
            new WorkerId(id),
            new WorkerUserId(userId),
            yearsExperience,
            certificationUrl,
            new WorkerVerificationStatus(verificationStatus),
            isActive,
            new WorkerCreatedAt(createdAt)
        );
        
        // Actualizar updatedAt manualmente
        worker.updatedAt = updatedAt;
        
        return worker;
    }
}

