import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsNotEmpty } from "class-validator";

export class CreateTeacherGroupDto {
    @ApiProperty({ description: "O'qituvchining ID si" })
    @IsNumber()
    @IsNotEmpty()
    teacher_id: number;

    @ApiProperty({ description: "Guruhning ID si" })
    @IsNumber()
    @IsNotEmpty()
    group_id: number;
}