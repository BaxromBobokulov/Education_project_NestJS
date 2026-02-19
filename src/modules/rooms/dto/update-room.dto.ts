import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { CreateRoomDto } from './create-room.dto';
import { IsOptional, IsString } from 'class-validator';

export class UpdateRoomDto extends PartialType(CreateRoomDto) {

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    name?: string | undefined;
}
