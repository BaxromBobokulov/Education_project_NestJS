import { ApiPropertyOptional } from "@nestjs/swagger"
import { IsOptional, IsString } from "class-validator"

export class filterGroupDto {

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    name: string

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    week_day: string

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    start_date: string
}