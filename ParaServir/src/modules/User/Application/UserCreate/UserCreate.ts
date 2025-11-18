import type { UserRepository } from "../../Domain/UserRepository";
import  { User } from "../../Domain/User";
import { UserEmail } from "../../Domain/UserEmail";
import { UserName } from "../../Domain/UserName";
import { UserId } from "../../Domain/UserId";
import { UserCreatedAt } from "../../Domain/UserCreatedAT";

export class UserCreate {
    constructor(repository: UserRepository) {
        this.repository = repository;
    }

    private repository: UserRepository;

    async run(
        id: string,
        name: string,
        email : string,
        password : string) : Promise<void> {
        const user = new User(
            new UserId(id),
            new UserName(name),
            new UserEmail(email),
            password,   
            "user",
            false,
            new UserCreatedAt(new Date()));
    await this.repository.create(user);
  
    }
}
