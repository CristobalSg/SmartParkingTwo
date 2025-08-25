export class User {
    constructor(
        readonly id: string,
        readonly email: string,
        readonly name: string,
        readonly emailVerified: boolean,
        readonly verificationToken: string | null,
        readonly createdAt: Date,
        readonly updatedAt: Date,

    ) { }
}

