// delete-expense.dto.ts
import { IsNotEmpty, IsNumber, IsString, MinLength } from 'class-validator';


export class DeleteExpenseDto {
  
    @IsNumber()
    @IsNotEmpty()
    expense_id: number;

    @IsNumber()
    @IsNotEmpty()
    user_id: number;
  }
  