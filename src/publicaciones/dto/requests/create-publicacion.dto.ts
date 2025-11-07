import { IsBoolean, IsNotEmpty, IsOptional, IsString } from "class-validator"
import { ApiProperty } from '@nestjs/swagger';

export class CreatePublicacionDto {
    @IsString()
    @IsNotEmpty()
    @ApiProperty({ description: 'Contenido de la publicacion', example: 'Este es el contenido de la publicacion' })
    description: string

    @IsString()
    @IsOptional()
    @IsNotEmpty()
    @ApiProperty({ description: 'URL de la imagen asociada a la publicacion', example: 'http://example.com/imagen.jpg', required: false })
    imagen?: string

    @IsOptional()
    @IsBoolean()
    @ApiProperty({ description: 'Indica si la publicacion es anonima', example: false, required: false })
    esAnonimo: boolean | undefined = false;
}
