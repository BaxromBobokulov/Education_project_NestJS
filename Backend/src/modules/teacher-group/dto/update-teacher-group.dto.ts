import { PartialType } from '@nestjs/swagger';
import { CreateTeacherGroupDto } from './create-teacher-group.dto';

export class UpdateTeacherGroupDto extends PartialType(CreateTeacherGroupDto) {}