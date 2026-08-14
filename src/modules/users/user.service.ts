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



    async findByEmail(email: string) {
        // Add a safety check (Optional but good practice)
        if (!email) {
            throw new Error('Email is required');
        }

        return await this.prismaServie.user.findUnique({
            where: { email },

        })

    }

    async findOne(id: number) {
        // Add a safety check (Optional but good practice)
        if (!id) {
            throw new Error('ID is required');
        }
        return await this.prismaServie.user.findUnique({
            where: { id }
        })
    }


    async updateProfileImage(userId: number, filePath: string) {

        return await this.prismaServie.user.update({
            where: { id: userId },
            data: { profileImage: filePath },
            select: { id: true, name: true, profileImage: true }
        })
    }




}