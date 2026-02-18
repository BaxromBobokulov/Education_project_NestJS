import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsMobilePhone, IsOptional, IsString, Matches } from 'class-validator';

export class UpdateUserDto extends PartialType(CreateUserDto) {
        
        @ApiPropertyOptional()
        @IsOptional()
        @IsString()
        first_name: string
    
        @ApiPropertyOptional()
        @IsOptional()
        @IsString()
        last_name: string
    
        @ApiPropertyOptional()
        @IsOptional()
        @IsString()
        @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,)
        password: string
    
        @ApiPropertyOptional()
        @IsOptional()
        @IsMobilePhone("uz-UZ")
        phone: string   
    
        @ApiPropertyOptional()
        @IsOptional()
        @IsEmail()
        @IsString()
        email: string 
        
    
        @ApiPropertyOptional()
        @IsOptional()
        @IsString()
        address: string
}
