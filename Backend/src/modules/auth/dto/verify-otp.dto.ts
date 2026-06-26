import { ApiProperty } from "@nestjs/swagger";
import { IsMobilePhone, IsString } from "class-validator";

export class VerifyOtpDto {
    @ApiProperty()
    @IsMobilePhone("uz-UZ")
    phone: string;

    @ApiProperty()
    @IsString()
    code: string;
}
