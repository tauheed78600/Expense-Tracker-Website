import { Get, HttpException, HttpStatus, Injectable, } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import exp from 'constants';
import e from 'express';
import { Expense } from 'src/entity/expense.entity';
import { UserEntity } from 'src/entity/user.entity';
import { Repository } from 'typeorm';




@Injectable()
export class ExpenseService {
  
    constructor(
        @InjectRepository(Expense)
        private readonly ExpenseRepository: Repository<Expense>,
        @InjectRepository(UserEntity) 
        private readonly userRepo: Repository<UserEntity>,
        
      ){}

     

      async AddingExpenses(expenseEntity: Expense, userId: number){
        
        const user = await this.userRepo.findOne({where:{ userId}});
        
        const dateWithoutTime = new Date(expenseEntity.date).toISOString().split('T')[0];
        expenseEntity.date = dateWithoutTime;
        console.log("dateWithoutTime", dateWithoutTime);
        
        const remaining_budget = user.remaining_budget - expenseEntity.amount
        console.log("remaining budget in add expense", remaining_budget)
        if (expenseEntity.amount > user.monthly_budget)
        {
          throw new HttpException('Budget limit Exceeded', HttpStatus.BAD_REQUEST);
        }
        else{ if (expenseEntity.amount > user.remaining_budget)
          throw new HttpException('Budget limit Exceeded', HttpStatus.BAD_REQUEST);
        }
        if (remaining_budget < 0 )
        {
          console.log("inside if condition")
          user.remaining_budget = 0
          await this.userRepo.save(user)
          throw new HttpException('Budget limit Exceeded', HttpStatus.BAD_REQUEST);
        }
        
        user.remaining_budget = user.remaining_budget - expenseEntity.amount
        await this.userRepo.save(user)
        return this.ExpenseRepository.save(expenseEntity);
      }

      async getExpensesForUser(userId: number): Promise<Expense[]>
      {
        const expenses = await this.ExpenseRepository.find({ where: { userId: userId } });
        return expenses;
      }

      async GetAllExpenses(): Promise<Expense[]>{
         console.log("Into Get Expense Service Class")
        return this.ExpenseRepository.find();
      }

      async GetExpense(userId: number): Promise<any> { // Assuming any is the type returned by findOne
        console.log("Into Get Expense of a particular User Service Class");
        const expense = await this.ExpenseRepository.findOne({ where: { userId: userId } });
        return expense;
    }
    
      async DeletingExpenses(expenseId: number,userId: number)
      {
        
        const user = await this.userRepo.findOne({where: {userId}})
        console.log("user in delete expense", user)
        console.log("expense_Id", expenseId); 
        const expense = await this.ExpenseRepository.findOne({where: {expenseId: expenseId}})
        console.log("expense in delete expense", expense)
        user.remaining_budget = user.remaining_budget + expense.amount
        await this.userRepo.save(user)
        return this.ExpenseRepository.delete(expenseId)
      }

      async setBudgetGoal(budgetGoal: number, userId: number): Promise<any>
      {
          const user = await this.userRepo.findOne({where: {userId}})
          // console.log("before updated user", user)
          if (user.monthly_budget <= budgetGoal)
          {
            user.remaining_budget = budgetGoal - (user.monthly_budget - user.remaining_budget)
            user.monthly_budget = budgetGoal
            await this.userRepo.save(user)
            // console.log("user in setBudgetGoal", user)
          }
          else{
            {
              const expenses = await this.ExpenseRepository.find({where: {userId}})
              console.log("expenses", expenses)
              if ((user.monthly_budget - user.remaining_budget) <= budgetGoal)
              {
                user.remaining_budget = budgetGoal - (user.monthly_budget - user.remaining_budget)
                user.monthly_budget = budgetGoal
                console.log("user.monthly",user.monthly_budget)
                
                console.log("user.remaining",user.remaining_budget)
                await this.userRepo.save(user)
                console.log("user after saving", user)
              } 
              else if (budgetGoal < user.remaining_budget){
                console.log("in the budgetGoal < user.remaining_budget condition")
                throw new HttpException('Insufficient budget,  set the new goal.', HttpStatus.BAD_REQUEST);
              }
              
              else{
                user.monthly_budget = budgetGoal
                await this.userRepo.save(user)
              }    
            }
          }        
      }

      async UpdatingExpenses(expense: Expense, userId: number) {
       
        const expenseEnt = await this.ExpenseRepository.findOne({ where: { expenseId: expense.expenseId } });
        if (!expenseEnt) {
          throw new Error('Expense not found');
        }
        const user = await this.userRepo.findOne({where: {userId: userId}})
        if ((user.monthly_budget - expense.amount) < 0)
        {
          throw new HttpException('Budget limit Exceeded', HttpStatus.BAD_REQUEST);
        }
        if ((user.remaining_budget - expense.amount) < 0)
        {
          throw new HttpException('Budget limit Exceeded', HttpStatus.BAD_REQUEST);
        }
        console.log("expenseEnt.amount", expenseEnt.amount)
        console.log("expense.amount", expense.amount)
        const amountDifference = expense.amount - expenseEnt.amount;

        // Update the expense amount
        expense.amount = expense.amount ;
        await this.ExpenseRepository.save(expense);
        // Adjust the user's remaining budget
        user.remaining_budget -= amountDifference;
        await this.userRepo.save(user);
        
        await this.userRepo.save(user)
        
        const updateData = {
          category: expense.category,
          merchant: expense.merchant,
          amount: expense.amount,
          paymentMode: expense.paymentMode
        };

        return this.ExpenseRepository.update(expense.expenseId, updateData);
      }
      
      async getExpensesByUser(userId: number): Promise<Expense[]> {

        const expenses = await this.ExpenseRepository.find({ where: { userId: userId } });
        
        return expenses;
      }

  }


