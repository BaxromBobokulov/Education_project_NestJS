import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateLessonDto {
  @ApiProperty({ example: 'React hooks and state management', required: false })
  @IsOptional()
  @IsString()
  topic?: string;

  @ApiProperty({ example: 'React hooks depth description', required: false })
  @IsOptional()
  @IsString()
  description?: string;
}
