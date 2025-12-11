import { WorkerCreate } from "../../../Application/WorkerCreate/WorkerCreate";
import { WorkerGetOneById } from "../../../Application/WorkerGetOneById/WorkerGetOneById";
import { WorkerGetAll } from "../../../Application/WorkerGetAll/WorkerGetAll";
import { WorkerGetByUserId } from "../../../Application/WorkerGetByUserId/WorkerGetByUserId";
import { WorkerEdit } from "../../../Application/WorkerEdit/WorkerEdit";
import { WorkerDelete } from "../../../Application/WorkerDelete/WorkerDelete";
import { WorkerVerify } from "../../../Application/WorkerVerify/WorkerVerify";
import { WorkerActivate } from "../../../Application/WorkerActivate/WorkerActivate";
import { WorkerDeactivate } from "../../../Application/WorkerDeactivate/WorkerDeactivate";
import type { WorkerRepository } from "../../../Domain/repositories/WorkerRepository";

export class WorkerController {
    private workerCreate: WorkerCreate;
    private workerGetOneById: WorkerGetOneById;
    private workerGetAll: WorkerGetAll;
    private workerGetByUserId: WorkerGetByUserId;
    private workerEdit: WorkerEdit;
    private workerDelete: WorkerDelete;
    private workerVerify: WorkerVerify;
    private workerActivate: WorkerActivate;
    private workerDeactivate: WorkerDeactivate;

    constructor(repository: WorkerRepository) {
        this.workerCreate = new WorkerCreate(repository);
        this.workerGetOneById = new WorkerGetOneById(repository);
        this.workerGetAll = new WorkerGetAll(repository);
        this.workerGetByUserId = new WorkerGetByUserId(repository);
        this.workerEdit = new WorkerEdit(repository);
        this.workerDelete = new WorkerDelete(repository);
        this.workerVerify = new WorkerVerify(repository);
        this.workerActivate = new WorkerActivate(repository);
        this.workerDeactivate = new WorkerDeactivate(repository);
    }

    async createWorker(
        userId: string,
        yearsExperience: number = 0,
        certificationUrl?: string
    ) {
        return await this.workerCreate.run(userId, yearsExperience, certificationUrl);
    }

    async getWorkerById(id: string) {
        return await this.workerGetOneById.run(id);
    }

    async getAllWorkers(activeOnly: boolean = false) {
        return await this.workerGetAll.run(activeOnly);
    }

    async getWorkerByUserId(userId: string) {
        return await this.workerGetByUserId.run(userId);
    }

    async editWorker(
        id: string,
        yearsExperience?: number,
        certificationUrl?: string,
        verificationStatus?: string,
        isActive?: boolean
    ) {
        return await this.workerEdit.run(id, yearsExperience, certificationUrl, verificationStatus, isActive);
    }

    async deleteWorker(id: string) {
        return await this.workerDelete.run(id);
    }

    async verifyWorker(id: string) {
        return await this.workerVerify.run(id);
    }

    async activateWorker(id: string) {
        return await this.workerActivate.run(id);
    }

    async deactivateWorker(id: string) {
        return await this.workerDeactivate.run(id);
    }
}

