import { ApiPropertyOptional } from "@nestjs/swagger"
import { IsEmail, IsMobilePhone, IsOptional, IsString } from "class-validator"

export class filterTeacherDto {
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    first_name: string

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    last_name: string

    @ApiPropertyOptional()
    @IsOptional()
    @IsMobilePhone("uz-UZ")
    phone: string

    @ApiPropertyOptional()
    @IsOptional()
    @IsEmail()
    @IsString()
    email: string
}