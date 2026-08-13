import { Module } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { UserModule } from "../users/user.module";
import { PassportModule } from "@nestjs/passport";
import { JwtModule } from "@nestjs/jwt";
import { JwtStrategy } from "./jwt.strategy";
import { ConfigService } from "@nestjs/config";
import { CONFIG_KEYS } from "src/common/constants/config.keys";


@Module({
    imports: [
        UserModule,
        PassportModule,
        JwtModule.registerAsync({
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                secret: configService.getOrThrow<string>(CONFIG_KEYS.JWT_SECRET),
                signOptions: { expiresIn: configService.getOrThrow(CONFIG_KEYS.JWT_EXPIRES_IN) }
            })
        })
    ],
    controllers: [AuthController],
    providers: [AuthService, JwtStrategy]
})

export class AuthModule {







}