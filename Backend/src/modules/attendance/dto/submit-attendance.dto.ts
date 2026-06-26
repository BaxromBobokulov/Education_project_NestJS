import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsInt, IsNotEmpty, IsOptional, IsString, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class AttendanceRecordDto {
  @ApiProperty({ example: 5, description: 'O\'quvchining User.id si' })
  @IsInt()
  @Min(1)
  student_id: number;

  @ApiProperty({ example: true, description: 'Darsga kelganmi yoki yo\'qmi' })
  @IsBoolean()
  isPresent: boolean;
}

export class SubmitAttendanceDto {
  @ApiProperty({ example: 3, description: 'Guruh IDsi' })
  @IsInt()
  @Min(1)
  group_id: number;

  @ApiProperty({ example: '2026-05-11', description: 'Dars sanasi (YYYY-MM-DD)', required: false })
  @IsOptional()
  @IsString()
  date?: string;

  @ApiProperty({ example: 'CRM groupinner full', description: 'Dars mavzusi' })
  @IsString()
  @IsNotEmpty()
  topic: string;

  @ApiProperty({ example: '', description: 'Qo\'shimcha izoh', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ type: [AttendanceRecordDto], description: 'Har bir o\'quvchining davomati' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AttendanceRecordDto)
  students: AttendanceRecordDto[];
}
