import { Body, Controller, Get, Param, ParseIntPipe, Post, Request, UseGuards } from "@nestjs/common";
import { UserService } from "./user.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { AuthGuard } from "@nestjs/passport";



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



    @Get(':id')
    async getById(@Param('id', ParseIntPipe) id: number) {
        return this.userService.findOne(id)
    }

    @UseGuards(AuthGuard('jwt'))
    @Get('profile')
    async getUserProfile(@Request() req: any) {
        return req.user
    }






}