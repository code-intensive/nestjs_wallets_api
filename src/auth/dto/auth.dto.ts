import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsStrongPassword,
  MinLength,
} from 'class-validator';

const MIN_LENGTH = 4;

export class SignInDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsStrongPassword()
  password: string;
}

export class SignUpDto extends SignInDto {
  @IsOptional()
  @IsString()
  @MinLength(MIN_LENGTH)
  first_name: string;

  @IsOptional()
  @IsString()
  @MinLength(MIN_LENGTH)
  last_name: string;
}

export interface AccessToken {
  access_token: string;
}
