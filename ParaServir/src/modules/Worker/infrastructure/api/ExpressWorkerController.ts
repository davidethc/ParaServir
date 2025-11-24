import type { Request, Response } from "express";
import { WorkerProfileCreate } from "../../Application/WorkerProfileCreate/WorkerProfileCreate";
import { WorkerProfileGetByUserId } from "../../Application/WorkerProfileGetByUserId/WorkerProfileGetByUserId";
import { WorkerProfileUpdate } from "../../Application/WorkerProfileUpdate/WorkerProfileUpdate";
import { WorkerServiceCreate } from "../../Application/WorkerServiceCreate/WorkerServiceCreate";
import { WorkerServiceGetByWorkerId } from "../../Application/WorkerServiceGetByWorkerId/WorkerServiceGetByWorkerId";
import { WorkerServiceUpdate } from "../../Application/WorkerServiceUpdate/WorkerServiceUpdate";
import { WorkerNotFoundError } from "../../Domain/WorkerNotFoundError";

export class ExpressWorkerController {
  private workerProfileCreate: WorkerProfileCreate;
  private workerProfileGetByUserId: WorkerProfileGetByUserId;
  private workerProfileUpdate: WorkerProfileUpdate;
  private workerServiceCreate: WorkerServiceCreate;
  private workerServiceGetByWorkerId: WorkerServiceGetByWorkerId;
  private workerServiceUpdate: WorkerServiceUpdate;

  constructor(
    workerProfileCreate: WorkerProfileCreate,
    workerProfileGetByUserId: WorkerProfileGetByUserId,
    workerProfileUpdate: WorkerProfileUpdate,
    workerServiceCreate: WorkerServiceCreate,
    workerServiceGetByWorkerId: WorkerServiceGetByWorkerId,
    workerServiceUpdate: WorkerServiceUpdate
  ) {
    this.workerProfileCreate = workerProfileCreate;
    this.workerProfileGetByUserId = workerProfileGetByUserId;
    this.workerProfileUpdate = workerProfileUpdate;
    this.workerServiceCreate = workerServiceCreate;
    this.workerServiceGetByWorkerId = workerServiceGetByWorkerId;
    this.workerServiceUpdate = workerServiceUpdate;
  }

  /**
   * POST /api/workers/profiles
   * Crear un nuevo perfil de trabajador
   */
  async createProfile(req: Request, res: Response): Promise<void> {
    try {
      const { id, user_id, service_description, years_experience, certification_url, is_active, verification_status } = req.body;

      if (!id || !user_id || !service_description || years_experience === undefined) {
        res.status(400).json({ 
          error: "Missing required fields", 
          required: ["id", "user_id", "service_description", "years_experience"] 
        });
        return;
      }

      const createdAt = req.body.created_at ? new Date(req.body.created_at) : new Date();

      await this.workerProfileCreate.run(
        id,
        user_id,
        service_description,
        years_experience,
        certification_url,
        is_active !== undefined ? is_active : true,
        verification_status || 'pending',
        createdAt
      );
      
      res.status(201).json({ 
        message: "Worker profile created successfully",
        profile: { id, user_id, service_description, years_experience }
      });
    } catch (error) {
      console.error("Error creating worker profile:", error);
      res.status(500).json({ 
        error: "Failed to create worker profile", 
        details: error instanceof Error ? error.message : String(error) 
      });
    }
  }

  /**
   * GET /api/workers/profiles/user/:userId
   * Obtener perfil de trabajador por user_id
   */
  async getProfileByUserId(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const profile = await this.workerProfileGetByUserId.run(userId);
      
      res.status(200).json({
        id: profile.id.value,
        user_id: profile.userId.value,
        service_description: profile.serviceDescription.value,
        years_experience: profile.yearsExperience.value,
        certification_url: profile.certificationUrl,
        is_active: profile.isActive,
        verification_status: profile.verificationStatus,
        created_at: profile.createdAt.value,
        updated_at: profile.updatedAt
      });
    } catch (error) {
      if (error instanceof WorkerNotFoundError) {
        res.status(404).json({ error: error.message });
        return;
      }
      console.error("Error getting worker profile:", error);
      res.status(500).json({ 
        error: "Failed to get worker profile", 
        details: error instanceof Error ? error.message : String(error) 
      });
    }
  }

  /**
   * PUT /api/workers/profiles/:id
   * Actualizar perfil de trabajador
   */
  async updateProfile(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { service_description, years_experience, certification_url, is_active, verification_status } = req.body;

      if (!service_description || years_experience === undefined) {
        res.status(400).json({ 
          error: "Missing required fields", 
          required: ["service_description", "years_experience"] 
        });
        return;
      }

      await this.workerProfileUpdate.run(
        id,
        service_description,
        years_experience,
        certification_url,
        is_active,
        verification_status
      );
      
      res.status(200).json({ 
        message: "Worker profile updated successfully",
        profile: { id, service_description, years_experience }
      });
    } catch (error) {
      if (error instanceof WorkerNotFoundError) {
        res.status(404).json({ error: error.message });
        return;
      }
      console.error("Error updating worker profile:", error);
      res.status(500).json({ 
        error: "Failed to update worker profile", 
        details: error instanceof Error ? error.message : String(error) 
      });
    }
  }

  /**
   * POST /api/workers/services
   * Crear un nuevo servicio de trabajador
   */
  async createService(req: Request, res: Response): Promise<void> {
    try {
      const { id, worker_id, category_id, title, description, base_price, is_available } = req.body;

      if (!id || !worker_id || !category_id || !title || !description || base_price === undefined) {
        res.status(400).json({ 
          error: "Missing required fields", 
          required: ["id", "worker_id", "category_id", "title", "description", "base_price"] 
        });
        return;
      }

      const createdAt = req.body.created_at ? new Date(req.body.created_at) : new Date();

      await this.workerServiceCreate.run(
        id,
        worker_id,
        category_id,
        title,
        description,
        base_price,
        is_available !== undefined ? is_available : true,
        createdAt
      );
      
      res.status(201).json({ 
        message: "Worker service created successfully",
        service: { id, worker_id, title, base_price }
      });
    } catch (error) {
      console.error("Error creating worker service:", error);
      res.status(500).json({ 
        error: "Failed to create worker service", 
        details: error instanceof Error ? error.message : String(error) 
      });
    }
  }

  /**
   * GET /api/workers/services/worker/:workerId
   * Obtener servicios de un trabajador
   */
  async getServicesByWorkerId(req: Request, res: Response): Promise<void> {
    try {
      const { workerId } = req.params;
      const services = await this.workerServiceGetByWorkerId.run(workerId);
      
      res.status(200).json(
        services.map(service => ({
          id: service.id,
          worker_id: service.workerId.value,
          category_id: service.categoryId.value,
          title: service.title.value,
          description: service.description,
          base_price: service.basePrice.value,
          is_available: service.isAvailable,
          created_at: service.createdAt.value,
          updated_at: service.updatedAt
        }))
      );
    } catch (error) {
      console.error("Error getting worker services:", error);
      res.status(500).json({ 
        error: "Failed to get worker services", 
        details: error instanceof Error ? error.message : String(error) 
      });
    }
  }

  /**
   * PUT /api/workers/services/:id
   * Actualizar servicio de trabajador
   */
  async updateService(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { title, description, base_price, is_available } = req.body;

      if (!title || !description || base_price === undefined) {
        res.status(400).json({ 
          error: "Missing required fields", 
          required: ["title", "description", "base_price"] 
        });
        return;
      }

      await this.workerServiceUpdate.run(
        id,
        title,
        description,
        base_price,
        is_available
      );
      
      res.status(200).json({ 
        message: "Worker service updated successfully",
        service: { id, title, base_price }
      });
    } catch (error) {
      if (error instanceof WorkerNotFoundError) {
        res.status(404).json({ error: error.message });
        return;
      }
      console.error("Error updating worker service:", error);
      res.status(500).json({ 
        error: "Failed to update worker service", 
        details: error instanceof Error ? error.message : String(error) 
      });
    }
  }
}

