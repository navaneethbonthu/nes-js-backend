import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { UserService } from "./user.service";
import { CreateUserDto } from "./dto/create-user.dto";



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
    async getById(@Param('id') id: number) {
        return this.userService.findOne(id)
    }



}