import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './entity/user.entity';
import { Expense } from './entity/expense.entity';
import { LoginModule } from './LoginModule/login.module';
import { ConfigModule } from '@nestjs/config'; 
import { JwtModule } from '@nestjs/jwt'; 
import { ExpenseModule } from './ExpenseModule/expense.module';
import { ChartModule } from './ChartModule/chart.module'; 

@Module({
  imports: [TypeOrmModule.forRoot({
    type: 'mysql',
    host: '127.0.0.1',
    port: 3306,
    username: 'root',
    password: 'Tauheed123',
    database: 'expense_tracker',
    entities: [UserEntity, Expense],
    synchronize: true,
  }),
  LoginModule,
  ChartModule,
  ExpenseModule,
  ConfigModule.forRoot(),
  JwtModule.register({
    secret: '5f83805a-01eb-47cd-b327-6697be859a88',
    signOptions: {expiresIn: '2h'}
  }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
