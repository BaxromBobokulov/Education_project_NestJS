import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { CreateStudentGroupDto } from './create-student-group.dto';
import { IsNumber, IsOptional } from 'class-validator';

export class UpdateStudentGroupDto extends PartialType(CreateStudentGroupDto) {

    @ApiPropertyOptional()
    @IsOptional()
    @IsNumber()
    student_id: number

    @ApiPropertyOptional()
    @IsOptional()
    @IsNumber()
    group_id: number
}
