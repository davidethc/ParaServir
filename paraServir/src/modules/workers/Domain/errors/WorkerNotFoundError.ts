export class WorkerNotFoundError extends Error {
    constructor(message: string = "Worker not found") {
        super(message);
        this.name = "WorkerNotFoundError";
    }
}

