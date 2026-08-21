import { ForbiddenException, Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { UserService } from "../users/user.service";
import { LoginDto } from "./dto/login.dto";
import * as bcrypt from 'bcrypt'
import { JwtService } from "@nestjs/jwt";
import { first, throttle } from "rxjs";
import { ConfigService, ConfigType } from "@nestjs/config";
import { CONFIG_KEYS } from "src/common/constants/config.keys";
import { Prisma } from "@prisma/client";
import { Throttle } from "@nestjs/throttler";



@Injectable()

export class AuthService {


    constructor(
        private jwtService: JwtService,
        private userService: UserService,
        private configService: ConfigService,
        private prismaService: PrismaService) { }


    @Throttle({ default: { limit: 5, ttl: 60000 } }) // Only 5 login attempts per minute
    async login(dto: LoginDto) {
        const user = await this.userService.findByEmail(dto.email)

        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }


        const isPasswordMaching = await bcrypt.compare(dto.password, user.password)

        if (!isPasswordMaching) {
            throw new UnauthorizedException("Invalid credentials")
        }

        const tokens = await this.getTokens(user.id, user.email, user.role);

        await this.updateRefreshToken(user.id, tokens.refreshToken)


        return {
            access_token: tokens.accessToken,
            refresh_token: tokens.refreshToken,
            user: {
                id: user.id,
                email: user.email,
                name: user.name
            }

        }



    }


    async getTokens(userId: number, email: string, role: string) {
        const [accessToken, refreshToken] = await Promise.all([
            this.jwtService.signAsync(
                { sub: userId, email, role },
                {
                    secret: this.configService.getOrThrow(CONFIG_KEYS.JWT_SECRET),
                    expiresIn: this.configService.getOrThrow(CONFIG_KEYS.JWT_EXPIRES_IN)
                }
            ),
            this.jwtService.signAsync({
                sub: userId, email, role
            }, {
                secret: this.configService.getOrThrow(CONFIG_KEYS.JWT_REFRESH_SECRET),
                expiresIn: this.configService.getOrThrow(CONFIG_KEYS.JWT_REFRESH_EXPIRES_IN)
            })

        ])

        return { accessToken, refreshToken }
    }


    async updateRefreshToken(userId: number, refreshToken: string) {
        const hashedToken = await bcrypt.hash(refreshToken, 10);
        await this.prismaService.user.update({
            where: { id: userId },
            data: { refreshToken: hashedToken },
        });
    }


    async rotateTokens(userId: number, refreshToken: string) {
        const user = await this.prismaService.user.findUnique({
            where: { id: userId },
        });

        if (!user || !user.refreshToken) {
            throw new ForbiddenException('Access Denied');
        }
        const hashedToken = await bcrypt.hash(refreshToken, 10);
        const isMatch = await bcrypt.compare(refreshToken, user.refreshToken);

        if (!isMatch) {
            throw new ForbiddenException("Access Denied for refreshtoken not match");
        }

        const tokens = this.getTokens(user.id, user.email, user.role)
        await this.updateRefreshToken(user.id, (await tokens).refreshToken)
        return tokens
    }


    async logout(userId: number) {
        await this.prismaService.user.update({
            where: { id: userId },
            data: { refreshToken: null }
        })
    }





}