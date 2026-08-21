import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { Passport } from "passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { CONFIG_KEYS } from "src/common/constants/config.keys";
import { JwtPayload } from "./types/jwt-payload.type";


@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {

    constructor(private configService: ConfigService) {

        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.getOrThrow<string>(CONFIG_KEYS.JWT_SECRET),
        });
    }




    async validate(payload: JwtPayload) {
        return { userId: payload.sub, email: payload.email, role: payload.role }
    }



}