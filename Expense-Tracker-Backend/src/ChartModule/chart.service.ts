import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Expense } from 'src/entity/expense.entity';  
import { UserEntity } from 'src/entity/user.entity'; 

@Injectable()
export class ChartService {
  constructor(
    @InjectRepository(Expense)
    private readonly expenseRepository: Repository<Expense>,
  ) {}

  async getExpensesByCategory(userId: number): Promise<Expense[]> {
    return this.expenseRepository.createQueryBuilder('expense')
      .where('expense.userId = :userId', { userId })
      .orderBy('expense.category', 'ASC')
      .getMany();
  }

  async getExpensesByMerchant(userId: number): Promise<Expense[]> {
    return this.expenseRepository.createQueryBuilder('expense')
      .where('expense.userId = :userId', { userId })
      .orderBy('expense.merchant', 'ASC')
      .getMany();
  }

//   async getExpensesByPaymentMode(userId: number): Promise<Expense[]> {
//  return this.expenseRepository.createQueryBuilder('expense')
//     .where('expense.userId = :userId', { userId })
//     .andWhere('expense.paymentMode IN (:...paymentModes)', { paymentModes: ['Credit', 'Debit', 'UPI', 'Cash'] })
//     .orderBy('expense.paymentMode', 'ASC') 
//     .getMany();
// }

async getExpensesByPaymentMode(userId: number): Promise<any> {
  return this.expenseRepository.createQueryBuilder('expense')
     .select("expense.paymentMode", "paymentMode")
     .addSelect("SUM(expense.amount)", "totalAmount")
     .where('expense.userId = :userId', { userId })
     .andWhere('expense.paymentMode IN (:...paymentModes)', { paymentModes: ['Credit', 'Debit', 'UPI', 'Cash'] })
     .groupBy('expense.paymentMode')
     .orderBy('expense.paymentMode', 'ASC')
     .getRawMany();
 } 

}
