import { IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UserQueries {
    @ApiProperty({
        description: 'Límite de resultados a devolver',
        required: false,
        type: Number,
        example: 10
    })
    @IsNumber()
    @IsOptional()
    limit?: number;

    @ApiProperty({
        description: 'Texto de búsqueda para filtrar usuarios por nombre',
        required: false,
        type: String,
        example: 'Juan'
    })
    @IsString()
    @IsOptional()
    search?: string;

    @ApiProperty({
        description: 'Filtrar usuarios por país',
        required: false,
        type: String,
        example: 'Colombia'
    })
    @IsString()
    @IsOptional()
    country?: string
}