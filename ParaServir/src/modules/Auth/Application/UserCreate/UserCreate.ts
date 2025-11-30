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
        lastName : string,
        email : string,
        password : string,
        role : string,
        isVerified : boolean,
        createdAt : Date,
    ) : Promise<void> {
        const user = new User(
            new UserId(id),
            new UserName(name),
            lastName,
                new UserEmail(email),
            password,   
            role,
            isVerified,
            new UserCreatedAt(createdAt));
    await this.repository.create(user);
  
    }
}
