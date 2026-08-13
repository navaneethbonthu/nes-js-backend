import { Role } from '@prisma/client';
import { IsEmail, IsEnum, IsNotEmpty, IsOptional, isString, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
    @IsEmail({}, { message: 'Please provide a valid email' })
    email!: string;


    @IsNotEmpty()
    @IsString()
    name!: string

    @IsString()
    @MinLength(6, { message: 'Password must be at least 6 characters long' })
    password!: string;


    @IsEnum(Role)
    @IsOptional()
    role?: Role;

}