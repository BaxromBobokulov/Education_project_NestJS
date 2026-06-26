import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"
import { IsArray, IsNumber, IsOptional, IsString, Max } from "class-validator"

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
    room_id: number

    @ApiProperty({ example: "2026-01-15" })
    @IsString()
    start_date: string

    @ApiProperty({ description: 'Array of week days e.g. ["MONDAY","WEDNESDAY"]' })
    @IsArray()
    week_day: string[]

    @ApiProperty()
    @IsString()
    start_time: string

    @ApiProperty()
    @IsNumber()
    @Max(30)
    max_student: number

    @ApiPropertyOptional({
        description: "Guruhga biriktiriladigan o'qituvchilar ID lari (bir yoki bir nechta)",
        type: [Number],
        example: [1, 2],
    })
    @IsArray()
    @IsOptional()
    teacher_ids?: number[]

    @ApiPropertyOptional({
        description: "Guruhga biriktiriladigan talabalar ID lari (bir yoki bir nechta)",
        type: [Number],
        example: [5, 6, 7],
    })
    @IsArray()
    @IsOptional()
    student_ids?: number[]
}
