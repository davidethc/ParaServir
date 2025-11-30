import type { UserCreatedAt } from "./UserCreatedAT";
import type { UserEmail } from "./UserEmail";
import type { UserId } from "./UserId";

import type { UserName } from "./UserName";



export class User {
    id : UserId;
    name : UserName;
    lastName : string;
    email : UserEmail;
    password : string;
    role : string;
    isVerified : boolean;
    createdAt : UserCreatedAt;
    updatedAt : Date;

    constructor(id : UserId, name : UserName, lastName : string, email : UserEmail, password : string
        ,role : string, isVerified : boolean, createdAt : UserCreatedAt) {
        this.id = id;
        this.name = name;
        this.lastName = lastName;
        this.email = email;
        this.password = password;
        this.role = role;
        this.isVerified = isVerified;
        this.createdAt = createdAt;
        this.updatedAt = new Date();
    }
}