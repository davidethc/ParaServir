import { UserCreate } from "../../../Application/UserCreate/UserCreate";
import { UserGetOneById } from "../../../Application/UserGetOneById/UserGetOneById";
import { UserGetAll } from "../../../Application/UsetGetAll/UserGetAll";
import { UserGetByEmail } from "../../../Application/UserGetByEmail/UserGetByEmail";
import { UserEdit } from "../../../Application/UserEdit/UserEdit";
import { UserDelete } from "../../../Application/UserDelete/UserDelete";
import { UserVerify } from "../../../Application/UserVerify/UserVerify";
import type { UserRepository } from "../../../Domain/repositories/UserRepository";

export class UserController {
    private userCreate: UserCreate;
    private userGetOneById: UserGetOneById;
    private userGetAll: UserGetAll;
    private userGetByEmail: UserGetByEmail;
    private userEdit: UserEdit;
    private userDelete: UserDelete;
    private userVerify: UserVerify;

    constructor(repository: UserRepository) {
        this.userCreate = new UserCreate(repository);
        this.userGetOneById = new UserGetOneById(repository);
        this.userGetAll = new UserGetAll(repository);
        this.userGetByEmail = new UserGetByEmail(repository);
        this.userEdit = new UserEdit(repository);
        this.userDelete = new UserDelete(repository);
        this.userVerify = new UserVerify(repository);
    }

    async createUser(
        email: string,
        passwordHash: string,
        role: string,
        isVerified: boolean = false
    ) {
        return await this.userCreate.run(email, passwordHash, role, isVerified);
    }

    async getUserById(id: string) {
        return await this.userGetOneById.run(id);
    }

    async getAllUsers() {
        return await this.userGetAll.run();
    }

    async getUserByEmail(email: string) {
        return await this.userGetByEmail.run(email);
    }

    async editUser(
        id: string,
        email?: string,
        passwordHash?: string,
        role?: string
    ) {
        return await this.userEdit.run(id, email, passwordHash, role);
    }

    async deleteUser(id: string) {
        return await this.userDelete.run(id);
    }

    async verifyUser(id: string) {
        return await this.userVerify.run(id);
    }
}

