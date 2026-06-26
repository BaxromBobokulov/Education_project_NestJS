import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { CreateGroupDto } from './create-group.dto';
import { IsNumber, IsOptional, IsString, Max } from 'class-validator';

export class UpdateGroupDto extends PartialType(CreateGroupDto) {
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    name: string

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    description?: string

    @ApiPropertyOptional()
    @IsOptional()
    @IsNumber()
    course_id: number

    @ApiPropertyOptional()
    @IsOptional()
    @IsNumber()
    room_id: number

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    start_date: string

    @ApiPropertyOptional()
    @IsOptional()
    week_day: string[]

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    start_time: string

    @ApiPropertyOptional()
    @IsOptional()
    @IsNumber()
    @Max(20)
    max_student: number
    
}
