
import { Role } from '@prisma/client';
import { Response, Request } from 'express';
export type RequestWithUser = Request & {
    user: {
        userId: number;
        email: string;
        role: Role;
    };
}