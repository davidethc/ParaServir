export interface WorkerServiceData {
  categoryId: string;
  title: string;
  description: string;
}

export class CompleteWorkerProfileDTO {
  services: WorkerServiceData[];

  constructor(services: WorkerServiceData[]) {
    if (services.length < 1 || services.length > 3) {
      throw new Error('Debes seleccionar entre 1 y 3 servicios');
    }
    this.services = services;
  }
}





