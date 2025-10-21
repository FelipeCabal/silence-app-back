import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { IsString } from 'class-validator';

export class UpdateUserDto extends PartialType(CreateUserDto) {
    @IsString()
    nombre?: string

    @IsString()
    password?: string

    @IsString()
    pais?: string

    @IsString()
    imagen?: string
}
