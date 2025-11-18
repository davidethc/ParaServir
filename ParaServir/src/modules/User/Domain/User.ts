import type { UserCreatedAt } from "./UserCreatedAT";
import type { UserEmail } from "./UserEmail";
import type { UserId } from "./UserId";
import { UserName } from "./UserName";

export class User {
    id : UserId;
    name : UserName;
    email : UserEmail;
    password : string;
    role : string;
    isVerified : boolean;
    createdAt : UserCreatedAt;
    updatedAt : Date;

    constructor(id : UserId, name : UserName, email : UserEmail, password : string
        ,role : string, isVerified : boolean, createdAt : UserCreatedAt) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.password = password;
        this.role = role;
        this.isVerified = isVerified;
        this.createdAt = createdAt;
        this.updatedAt = new Date();
    }
}