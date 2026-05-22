import { ApiProperty } from "@nestjs/swagger"
import { Role } from "@prisma/client"
import { IsEmail, IsEnum, IsMobilePhone, IsString, Matches } from "class-validator"

export class CreateUserDto {
    
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
    @IsEnum(Role)
    role: Role

    @ApiProperty()
    @IsEmail()
    @IsString()
    email: string 
    

    @ApiProperty()
    @IsString()
    address: string
}
