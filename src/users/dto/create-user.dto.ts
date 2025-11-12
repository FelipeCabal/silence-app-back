import { ApiProperty } from "@nestjs/swagger"
import { IsDate, IsEmail, IsNotEmpty, IsString } from "class-validator"

export class CreateUserDto {
    @IsString()
    @IsNotEmpty()
    @ApiProperty()
    nombre: string

    @IsNotEmpty()
    @IsEmail()
    @ApiProperty()
    email: string

    @IsDate()
    @IsNotEmpty()
    @ApiProperty()
    fechaNto: Date

    @IsString()
    @IsNotEmpty()
    @ApiProperty()
    sexo: string

    @IsNotEmpty()
    @IsString()
    @ApiProperty()
    password: string

    @IsString()
    @IsNotEmpty()
    @ApiProperty()
    pais: string
}
