import { PostgresUserRepository } from "../../User/infrastructure/persistence/PostgresUserRepository";
import { InMemoryUserRepository } from "../../User/infrastructure/persistence/inMemoryUserRepository";
import type { UserRepository } from "../../User/Domain/UserRepository";
import { UserCreate } from "../../User/Application/UserCreate/UserCreate";
import { UserGetAll } from "../../User/Application/UsetGetAll/UserGetAll";
import { UserGetOneById } from "../../User/Application/UserGetOneById/UserGetOneById";
import { UserEdit } from "../../User/Application/UserEdit/UserEdit";
import { UserDelete } from "../../User/Application/UserDelete/UserDelete";
import { UserLogin } from "../../User/Application/UserLogin/UserLogin";
import { ExpressUserController } from "../../User/infrastructure/api/ExppressUserController";
import { PostgresWorkerRepository } from "../../Worker/infrastructure/persistence/PostgresWorkerRepository";
import { InMemoryWorkerRepository } from "../../Worker/infrastructure/persistence/inMemoryWorkerRepository";
import type { WorkerRepository } from "../../Worker/Domain/WorkerRepository";
import { WorkerProfileCreate } from "../../Worker/Application/WorkerProfileCreate/WorkerProfileCreate";
import { WorkerProfileGetByUserId } from "../../Worker/Application/WorkerProfileGetByUserId/WorkerProfileGetByUserId";
import { WorkerProfileUpdate } from "../../Worker/Application/WorkerProfileUpdate/WorkerProfileUpdate";
import { WorkerServiceCreate } from "../../Worker/Application/WorkerServiceCreate/WorkerServiceCreate";
import { WorkerServiceGetByWorkerId } from "../../Worker/Application/WorkerServiceGetByWorkerId/WorkerServiceGetByWorkerId";
import { WorkerServiceUpdate } from "../../Worker/Application/WorkerServiceUpdate/WorkerServiceUpdate";
import { ExpressWorkerController } from "../../Worker/infrastructure/api/ExpressWorkerController";

export class ServiceContainer {
  private userRepository: UserRepository;
  private userCreate: UserCreate;
  private userGetAll: UserGetAll;
  private userGetOneById: UserGetOneById;
  private userEdit: UserEdit;
  private userDelete: UserDelete;
  private userLogin: UserLogin;
  private userController: ExpressUserController;

  private workerRepository: WorkerRepository;
  private workerProfileCreate: WorkerProfileCreate;
  private workerProfileGetByUserId: WorkerProfileGetByUserId;
  private workerProfileUpdate: WorkerProfileUpdate;
  private workerServiceCreate: WorkerServiceCreate;
  private workerServiceGetByWorkerId: WorkerServiceGetByWorkerId;
  private workerServiceUpdate: WorkerServiceUpdate;
  private workerController: ExpressWorkerController;

  constructor() {
    // Cambia aquí entre PostgresUserRepository o InMemoryUserRepository
    // Para desarrollo: usa InMemoryUserRepository
    // Para producción: usa PostgresUserRepository con DATABASE_URL
    const usePostgres = process.env.DATABASE_URL !== undefined;
    const databaseUrl = process.env.DATABASE_URL;
    
    // Inicializar User Repository
    if (usePostgres && databaseUrl) {
      this.userRepository = new PostgresUserRepository(databaseUrl);
    } else {
      this.userRepository = new InMemoryUserRepository();
    }

    // Inicializar casos de uso de User
    this.userCreate = new UserCreate(this.userRepository);
    this.userGetAll = new UserGetAll(this.userRepository);
    this.userGetOneById = new UserGetOneById(this.userRepository);
    this.userEdit = new UserEdit(this.userRepository);
    this.userDelete = new UserDelete(this.userRepository);
    this.userLogin = new UserLogin(this.userRepository);

    // Inicializar controlador de User
    this.userController = new ExpressUserController(
      this.userCreate,
      this.userGetAll,
      this.userGetOneById,
      this.userEdit,
      this.userDelete,
      this.userLogin
    );

    // Inicializar Worker Repository
    if (usePostgres && databaseUrl) {
      this.workerRepository = new PostgresWorkerRepository(databaseUrl);
    } else {
      this.workerRepository = new InMemoryWorkerRepository();
    }

    // Inicializar casos de uso de Worker
    this.workerProfileCreate = new WorkerProfileCreate(this.workerRepository);
    this.workerProfileGetByUserId = new WorkerProfileGetByUserId(this.workerRepository);
    this.workerProfileUpdate = new WorkerProfileUpdate(this.workerRepository);
    this.workerServiceCreate = new WorkerServiceCreate(this.workerRepository);
    this.workerServiceGetByWorkerId = new WorkerServiceGetByWorkerId(this.workerRepository);
    this.workerServiceUpdate = new WorkerServiceUpdate(this.workerRepository);

    // Inicializar controlador de Worker
    this.workerController = new ExpressWorkerController(
      this.workerProfileCreate,
      this.workerProfileGetByUserId,
      this.workerProfileUpdate,
      this.workerServiceCreate,
      this.workerServiceGetByWorkerId,
      this.workerServiceUpdate
    );
  }

  getUserController(): ExpressUserController {
    return this.userController;
  }

  getWorkerController(): ExpressWorkerController {
    return this.workerController;
  }
}

