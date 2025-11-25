import { IsBooleanString, IsNumber, IsOptional } from "class-validator";

export class PostQueries {
    @IsNumber()
    @IsOptional()
    limit?: number;

    @IsBooleanString()
    @IsOptional()
    showAnonymous?: string;
}