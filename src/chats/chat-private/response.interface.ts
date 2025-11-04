import { IsBoolean, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class ReponseData{
    @IsBoolean()
    err:boolean;
    @IsNotEmpty()
    @IsString()
    msg:string;
    @IsOptional()
    datas?:unknown
}