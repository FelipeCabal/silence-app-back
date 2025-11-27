import { PartialType } from '@nestjs/mapped-types';
import { CreatePublicacionDto } from './create-publicacion.dto';
import { IsBoolean, IsOptional, IsString, IsArray, ArrayMaxSize } from 'class-validator';
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

    @IsArray()
    @IsString({ each: true })
    @ArrayMaxSize(5, { message: 'No puede subir más de 5 imágenes' })
    @IsOptional()
    @ApiProperty({
        description: 'URLs de las imágenes de la publicacion (máximo 5)',
        example:
            [
                'https://example.com/imagen1.jpg',
                'https://example.com/imagen2.jpg'
            ],
        type: [String],
        required: false
    })
    imagen?: string[];
}
