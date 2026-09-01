import { Body, Controller, Get, Param, ParseIntPipe, Post, Request, UploadedFile, UseGuards, UseInterceptors } from "@nestjs/common";
import { UserService } from "./user.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { AuthGuard } from "@nestjs/passport";
import { FileInterceptor } from "@nestjs/platform-express";
import { multerOptions } from "../../common/utils/multer-options";
import type { RequestWithUser } from "../auth/types/user.type";
// import { Request } from "express";



@Controller('user')
export class UserControler {


    constructor(private userService: UserService) { }


    @Post('signup')
    async createUser(@Body() Body: CreateUserDto) {
        return this.userService.create(Body)
    }


    // @Get()
    // async getUserByEmail(@Body() email: string) {
    //     return this.userService.findByEmail(email)
    // }

    @UseGuards(AuthGuard('jwt'))
    @Get('profile')
    async getUserProfile(@Request() req: RequestWithUser) {
        console.log('user details', req.user)
        return req.user
    }

    @Get(':id')
    async getById(@Param('id', ParseIntPipe) id: number) {
        return this.userService.findOne(id)
    }




    @Post('upload-profile')
    @UseGuards(AuthGuard('jwt'))
    @UseInterceptors(FileInterceptor('file-key', multerOptions))
    async uploadFile(@UploadedFile() file: Express.Multer.File, @Request() req) {

        return this.userService.updateProfileImage(req.user.userId, file.path)
    }






}