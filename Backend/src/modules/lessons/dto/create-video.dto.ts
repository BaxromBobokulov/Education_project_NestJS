import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateVideoLessonDto {
  @ApiProperty({ example: 1 })
  @IsNotEmpty()
  @Type(() => Number) // Form-data'dan keladigan stringni raqamga o'giradi
  group_id: number;

  @ApiProperty({ example: 'React asoslari', required: false })
  @IsOptional()
  @IsString()
  topic?: string;
}