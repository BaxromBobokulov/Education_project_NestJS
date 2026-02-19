import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { CreateCourseDto } from './create-course.dto';
import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { CourseLevel } from '@prisma/client';

export class UpdateCourseDto extends PartialType(CreateCourseDto) {

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    name: string

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    description?: string | null

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

    @ApiPropertyOptional()
    @IsOptional()
    @IsEnum(CourseLevel)
    level: CourseLevel
}
