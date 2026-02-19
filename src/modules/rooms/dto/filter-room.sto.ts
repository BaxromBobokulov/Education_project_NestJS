import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

export class filterRoomDto {
        @ApiPropertyOptional()
        @IsOptional()
        @IsString()
        name?: string;
}