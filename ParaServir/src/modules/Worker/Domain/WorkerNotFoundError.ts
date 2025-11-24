export class WorkerNotFoundError extends Error {
    constructor(id: string) {
        super(`Worker with id ${id} not found`);
        this.name = "WorkerNotFoundError";
    }
}

