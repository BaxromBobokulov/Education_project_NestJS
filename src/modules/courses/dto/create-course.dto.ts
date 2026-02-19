import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { CourseLevel } from "@prisma/client";
import { IsEnum, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateCourseDto {

    @ApiProperty()
    @IsString()
    name: string

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    description?: string | null

    @ApiProperty()
    @IsNumber()
    price: number

    @ApiProperty()
    @IsNumber()
    duration_month: number

    @ApiProperty()
    @IsNumber()
    duration_hours: number

    @ApiProperty()
    @IsEnum(CourseLevel)
    level:CourseLevel
}
