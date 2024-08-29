import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExpenseController } from './expense.controller';
import {Expense} from 'src/entity/expense.entity'
import { ExpenseService } from './expense.service';
import { UserEntity } from 'src/entity/user.entity'; 
import { JwtStrategy } from './jwt.strategy';
import { JwtService } from '@nestjs/jwt';

@Module({
  controllers: [ExpenseController],
  providers: [ExpenseService, JwtStrategy, JwtService],
  imports: [TypeOrmModule.forFeature([Expense, UserEntity]),
            ],
})
export class ExpenseModule {}