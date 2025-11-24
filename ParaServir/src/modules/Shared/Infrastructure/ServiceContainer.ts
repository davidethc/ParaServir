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

export class ServiceContainer {
  private userRepository: UserRepository;
  private userCreate: UserCreate;
  private userGetAll: UserGetAll;
  private userGetOneById: UserGetOneById;
  private userEdit: UserEdit;
  private userDelete: UserDelete;
  private userLogin: UserLogin;
  private userController: ExpressUserController;

  constructor() {
    // Cambia aquí entre PostgresUserRepository o InMemoryUserRepository
    // Para desarrollo: usa InMemoryUserRepository
    // Para producción: usa PostgresUserRepository con DATABASE_URL
    const usePostgres = process.env.DATABASE_URL !== undefined;
    
    if (usePostgres) {
      const databaseUrl = process.env.DATABASE_URL;
      if (!databaseUrl) {
        throw new Error("DATABASE_URL environment variable is required for PostgresUserRepository");
      }
      this.userRepository = new PostgresUserRepository(databaseUrl);
    } else {
      this.userRepository = new InMemoryUserRepository();
    }

    // Inicializar casos de uso
    this.userCreate = new UserCreate(this.userRepository);
    this.userGetAll = new UserGetAll(this.userRepository);
    this.userGetOneById = new UserGetOneById(this.userRepository);
    this.userEdit = new UserEdit(this.userRepository);
    this.userDelete = new UserDelete(this.userRepository);
    this.userLogin = new UserLogin(this.userRepository);

    // Inicializar controlador
    this.userController = new ExpressUserController(
      this.userCreate,
      this.userGetAll,
      this.userGetOneById,
      this.userEdit,
      this.userDelete,
      this.userLogin
    );
  }

  getUserController(): ExpressUserController {
    return this.userController;
  }
}

