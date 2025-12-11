import { UserId } from "../../../Users/Domain/value-objects/UserId";

export class WorkerUserId {
    value: UserId;

    constructor(userId: string | UserId) {
        if (userId instanceof UserId) {
            this.value = userId;
        } else {
            this.value = new UserId(userId);
        }
    }

    get stringValue(): string {
        return this.value.value;
    }
}

