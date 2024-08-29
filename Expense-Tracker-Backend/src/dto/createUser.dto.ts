import { IsNotEmpty, IsNumber, IsString, MinLength } from 'class-validator';


export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsString()
  @IsNotEmpty()
  username: string;

  @IsNumber()
  @IsNotEmpty()
  monthlyBudget: number;
}
