import { ApiPropertyOptional } from "@nestjs/swagger"
import { IsNumber, IsOptional, IsString } from "class-validator"

export class filterCourseDo {
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    name: string

    @ApiPropertyOptional()
    @IsOptional()
    @IsNumber()
    price: number

    @ApiPropertyOptional()
    @IsOptional()
    @IsNumber()
    duration_month: number

    @ApiPropertyOptional()
    @IsOptional()
    @IsNumber()
    duration_hours: number
}