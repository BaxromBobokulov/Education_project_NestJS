import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"
import { IsArray, IsDateString, IsNumber, IsOptional, IsString, Max } from "class-validator"

export class CreateGroupDto {

    @ApiProperty()
    @IsString()
    name: string

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    description?: string

    @ApiProperty()
    @IsNumber()
    course_id: number

    @ApiProperty()
    @IsNumber()
    user_id: number

    @ApiProperty()
    @IsNumber()
    room_id: number

    @ApiProperty()
    @IsDateString()
    start_date: string

    @ApiProperty({ description: 'Array of week days e.g. ["MONDAY","WEDNESDAY"]' })
    @IsArray()
    week_day: string[]

    @ApiProperty()
    @IsString()
    start_time: string

    @ApiProperty()
    @IsNumber()
    @Max(20)
    max_student: number
}
