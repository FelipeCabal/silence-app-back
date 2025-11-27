import { IsBoolean, IsNotEmpty, IsOptional, IsString, IsArray, ArrayMaxSize } from "class-validator"
import { ApiProperty } from '@nestjs/swagger';

export class CreatePublicacionDto {
    @IsString()
    @IsNotEmpty()
    @ApiProperty({ description: 'Contenido de la publicacion', example: 'Este es el contenido de la publicacion' })
    description: string

    @IsArray()
    @IsString({ each: true })
    @ArrayMaxSize(5, { message: 'No puede subir más de 5 imágenes' })
    @IsOptional()
    @ApiProperty({
        description: 'URLs de las imágenes asociadas a la publicacion (máximo 5)',
        example:
            [
                'http://example.com/imagen1.jpg',
                'http://example.com/imagen2.jpg'
            ],
        type: [String],
        required: false
    })
    imagen?: string[];

    @IsOptional()
    @IsBoolean()
    @ApiProperty({ description: 'Indica si la publicacion es anonima', example: false, required: false })
    esAnonimo: boolean | undefined = false;
}
