import { ConflictException, Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateUserDto } from "./dto/create-user.dto";
import * as bcrypt from 'bcrypt';


@Injectable()
export class UserService {


    constructor(private prismaServie: PrismaService) { }

    async create(dto: CreateUserDto) {

        const existingUser = await this.prismaServie.user.findUnique({
            where: { email: dto.email }
        })

        if (existingUser) {
            throw new ConflictException("User already existed")
        }


        const salt = await bcrypt.genSalt()
        const hashedPassword = await bcrypt.hash(dto.password, salt)

        const newUser = await this.prismaServie.user.create({
            data: {
                ...dto,
                password: hashedPassword,
            },
        });

        const { password, ...result } = newUser
        return result;
    }



    findByEmail(email: string) {

        return this.prismaServie.user.findUnique({
            where: { email },

        })

    }

    findOne(id: number) {
        return this.prismaServie.user.findUnique({
            where: { id }
        })
    }



}