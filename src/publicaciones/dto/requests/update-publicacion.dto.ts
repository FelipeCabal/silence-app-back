import { PartialType } from '@nestjs/mapped-types';
import { CreatePublicacionDto } from './create-publicacion.dto';
import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdatePublicacionDto extends PartialType(CreatePublicacionDto) {
    @IsString()
    @IsOptional()
    @ApiProperty({ description: 'Contenido de la publicacion', example: 'Este es el contenido actualizado de la publicacion', required: false })
    description?: string

    @IsBoolean()
    @IsOptional()
    @ApiProperty({ description: 'Indica si la publicacion es anonima', example: true, required: false })
    esAnonimo?: boolean;

    @IsString()
    @IsOptional()
    @ApiProperty({ description: 'URL de la imagen de la publicacion', example: 'https://example.com/imagen.jpg', required: false })
    imagen?: string;
}
