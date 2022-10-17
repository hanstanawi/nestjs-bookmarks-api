import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class SignupDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  @IsString()
  password: string;

  @MinLength(1)
  @MaxLength(255)
  @IsOptional()
  firstName?: string;

  @MinLength(1)
  @MaxLength(255)
  @IsOptional()
  lastName?: string;
}
