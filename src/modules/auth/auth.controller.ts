import { Body, Controller, Post, Req, Res, UnauthorizedException, UseGuards } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { LoginDto } from "./dto/login.dto";
import express from 'express';
import { JwtService } from "@nestjs/jwt";
import { AuthGuard } from "@nestjs/passport";
import * as userType from "./types/user.type";



@Controller('auth')
export class AuthController {


    constructor(private authService: AuthService, private jwtService: JwtService) { }


    @Post('login')
    async login(@Body() body: LoginDto, @Res({ passthrough: true }) res: express.Response) {
        const tokens = await this.authService.login(body)

        res.cookie('refreshToken', tokens.refresh_token, {
            httpOnly: true,
            secure: true,
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        })
        return { accessToken: tokens.access_token };
    }


    @Post('refresh')
    async refresh(@Req() req: express.Request, @Res({ passthrough: true }) res: express.Response) {


        const refreshToken = req.cookies['refreshToken']
        if (!refreshToken) {

            throw new UnauthorizedException();
        }

        const decodeJwt = this.jwtService.decode(refreshToken)
        console.log('decodeJwt', decodeJwt)
        const tokens = await this.authService.rotateTokens(decodeJwt.sub, refreshToken)


        res.cookie('refreshToken', tokens.refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000
        })
        return { accessToken: tokens.accessToken };

    }


    @Post('logout')
    @UseGuards(AuthGuard('jwt'))
    async logout(@Req() req: userType.RequestWithUser, @Res({ passthrough: true }) res: express.Response) {
        await this.authService.logout(req.user.userId);
        res.clearCookie('refreshToken')
        return { message: 'Loggedout succssfully' }

    }








}