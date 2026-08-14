import { CanActivate, ExecutionContext, ForbiddenException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Observable } from "rxjs";
import { ROLES_KEY } from "../decorators/roles.decorator";
import { JwtService } from "@nestjs/jwt";
import { Role } from "@prisma/client";



export class RolesGuard implements CanActivate {
    constructor(private refrector: Reflector) { }

    canActivate(context: ExecutionContext): boolean {


        const requiredRoles = this.refrector.getAllAndOverride<Role[]>(ROLES_KEY, [context.getHandler(), context.getClass()])


        if (!requiredRoles) {
            return true
        }


        const { user } = context.switchToHttp().getRequest()


        const hasRole = requiredRoles.some((role) => role === user.role)

        if (!hasRole) {
            throw new ForbiddenException("You do not have permission to access this resource")
        }

        return true








    }
}