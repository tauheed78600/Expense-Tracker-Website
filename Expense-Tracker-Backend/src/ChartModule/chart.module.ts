import { Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from 'src/entity/user.entity';

import { JwtModule } from '@nestjs/jwt'; 
import { ChartService } from './chart.service';
import { ChartController } from './chart.controller';
import { Expense } from 'src/entity/expense.entity';

@Module({
    
  controllers: [ChartController],
  providers: [ChartService,],
  imports: [
    TypeOrmModule.forFeature([UserEntity, Expense]),
    
  ],
})
export class ChartModule {}