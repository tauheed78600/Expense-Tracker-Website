import { Body, Controller, Post, Get, Put, Param, Delete, Query, Res, HttpException, UseGuards  } from '@nestjs/common';
import { ExpenseService } from './expense.service';
import { Expense } from 'src/entity/expense.entity';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiBody } from '@nestjs/swagger';
import { DeleteExpenseDto } from 'src/dto/deleteExpense.dto'; 
import { JwtAuthGuard } from 'src/LoginModule/jwt-auth.guard';
import { JwtService } from "@nestjs/jwt";


@ApiTags('/expenses')
@Controller('/expenses')
export class ExpenseController 
{
  constructor(private readonly expenseService: ExpenseService, private readonly jwtService: JwtService,){

  }

  @ApiOperation({
    summary: 'Fetch expenses of User',
    description: 'This endpoint fetches the expenses of a user from the database',
  })
@ApiBearerAuth('JWT-auth')
@UseGuards(AuthGuard('jwt'))
@Get(':token')
async getExpensesByUser(@Param('token') token: string) {
  // console.log("accessToken in getExpensesByUser", token)
  const decodedToken = this.jwtService.decode(token)
  
  const expenses = await this.expenseService.getExpensesByUser(decodedToken.sub); 
  return expenses;
}

@ApiOperation({
  summary: 'Update monthly budget',
  description: 'This endpoint updates the monthly budget of the user',
})
  @ApiBearerAuth('JWT-auth')
  @UseGuards(AuthGuard('jwt'))
  @Put("budget-goal")
  async setBudgetForUser(@Query('monthly_budget') monthly_budget: number, @Query('token') token: string)
  {
    const decodedToken = this.jwtService.decode(token)
    console.log("accessToken in budget goal")
    const budget = await this.expenseService.setBudgetGoal(monthly_budget, decodedToken.sub)
    return budget
  }


  @ApiOperation({
    summary: 'Add Expense',
    description: 'This endpoint adds the expense for the user and updates the remaining budget accordingly',
  })
@ApiBearerAuth('JWT-auth')
@UseGuards(AuthGuard('jwt'))
@Post("/addExpense")
async addExpense(@Body() expenseEntity: Expense, @Query("token") token: string) {
  try {
    const decodedToken = this.jwtService.decode(token)
    return this.expenseService.AddingExpenses(expenseEntity, decodedToken.sub);
  } catch (error) {
    if (error instanceof HttpException) {
      console.log("inside catch", )
      return {
        status: error.getStatus(),
        message: error.message,
      };
    }
    throw error;
  }
}

@ApiOperation({
  summary: 'Delete Expense',
  description: 'This endpoint deletes the expense of a user and updates the remaining budget accordingly',
})
@ApiBearerAuth('JWT-auth')
@UseGuards(AuthGuard('jwt'))
@Delete("/deleteExpense")

  async deleteExpense(
    @Body() deleteExpenseDto: DeleteExpenseDto, @Query("token") token: string)
   {
    console.log("Into Delete Expense Functionality");
    const decodedToken = this.jwtService.decode(token)
    return this.expenseService.DeletingExpenses(deleteExpenseDto.expense_id, decodedToken.sub);
  }

@ApiOperation({
  summary: 'Update Expense',
  description: 'This endpoint updates the expense of a user and updates the remaining budget accordingly',
}) 
@ApiBearerAuth('JWT-auth')
@UseGuards(AuthGuard('jwt'))
@Put("/updateExpense")
  async updateExpense(@Body() expenseEntity: Expense, @Query("token") token: string) 
  {
    const decodedToken = this.jwtService.decode(token)
    const userId = decodedToken.sub
    return this.expenseService.UpdatingExpenses(expenseEntity, userId);
  }
}
