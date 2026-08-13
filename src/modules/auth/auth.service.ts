import { Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { UserService } from "../users/user.service";
import { LoginDto } from "./dto/login.dto";
import * as bcrypt from 'bcrypt'
import { JwtService } from "@nestjs/jwt";
import { first } from "rxjs";



@Injectable()

export class AuthService {


    constructor(private jwtService: JwtService, private userService: UserService) { }

    async login(dto: LoginDto) {
        const user = await this.userService.findByEmail(dto.email)

        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }


        const isPasswordMaching = await bcrypt.compare(dto.password, user.password)

        if (!isPasswordMaching) {
            throw new UnauthorizedException("Invalid credentials")
        }

        const payload = { sub: user.id, email: user.email, role: user.role }


        return {
            access_token: await this.jwtService.signAsync(payload),
            user: {
                id: user.id,
                email: user.email,
                name: user.name
            }

        }



    }



}