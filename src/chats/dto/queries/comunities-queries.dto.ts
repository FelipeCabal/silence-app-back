import { IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, Matches, MinLength } from 'class-validator';

export class ComunityAndGroupQueries {
    @IsNumber()
    @IsOptional()
    @MinLength(1)
    @IsPositive()
    limit?: number;

    @IsString()
    @IsOptional()
    @IsNotEmpty()
    @Matches(/\s/,{message:"no se permiten espacios vacios"})
    search?: string;

}