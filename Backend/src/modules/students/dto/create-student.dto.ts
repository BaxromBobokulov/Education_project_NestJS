import { ApiProperty } from "@nestjs/swagger"
import { Role } from "@prisma/client"
import { IsDateString, IsEmail, IsMobilePhone, IsString, Matches, IsOptional } from "class-validator"

export class CreateStudentDto {

    @ApiProperty()
    @IsString()
    first_name: string

    @ApiProperty()
    @IsString()
    last_name: string

    @ApiProperty()
    @IsString()
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,)
    password: string

    @ApiProperty()
    @IsMobilePhone("uz-UZ")
    phone: string

    @ApiProperty()
    @IsEmail()
    email: string

    @ApiProperty()
    @IsDateString()
    birth_date: string

    @ApiProperty()
    @IsString()
    address: string

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    groups?: string
}
