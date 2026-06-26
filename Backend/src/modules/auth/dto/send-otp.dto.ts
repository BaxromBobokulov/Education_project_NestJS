import { ApiProperty } from "@nestjs/swagger";
import { IsMobilePhone, IsString } from "class-validator";

export class SendOtpDto {
    @ApiProperty()
    @IsMobilePhone("uz-UZ")
    phone: string;
}