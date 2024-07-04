import { IsString, IsEmail, IsNotEmpty } from 'class-validator';

export class CreateGuestDto {
  @IsNotEmpty()
  @IsString()
  readonly firstName: string;

  @IsNotEmpty()
  @IsString()
  readonly lastName: string;

  @IsNotEmpty()
  @IsEmail()
  readonly email: string;

  @IsString()
  readonly phoneNumber: string;

}
