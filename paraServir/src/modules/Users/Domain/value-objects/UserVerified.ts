export class UserVerified {
    value: boolean;

    constructor(value: boolean) {
        this.value = value;
    }

    static createVerified(): UserVerified {
        return new UserVerified(true);
    }

    static createUnverified(): UserVerified {
        return new UserVerified(false);
    }
}

