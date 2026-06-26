import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateLessonDto {
  @ApiProperty({ example: 1 })
  @IsNotEmpty()
  @Type(() => Number)
  group_id: number;

  @ApiProperty({ example: 'React Router' })
  @IsNotEmpty()
  @IsString()
  topic: string;

  @ApiProperty({ example: 'React dynamic routing and nested routes', required: false })
  @IsOptional()
  @IsString()
  description?: string;
}
