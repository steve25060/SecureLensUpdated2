import { IsString, IsNotEmpty } from 'class-validator';

export class LoginDto {
  @IsString()
  @IsNotEmpty()
  username!: string; // <-- Add the '!' here

  @IsString()
  @IsNotEmpty()
  password!: string; // <-- Add the '!' here
}
