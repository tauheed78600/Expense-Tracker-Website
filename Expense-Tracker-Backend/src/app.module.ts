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
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { join } from 'path';

@Module({
  imports: [
    MailerModule.forRoot({
      transport: {
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
          user: 'tauheeddarekar786@gmail.com',
          pass: 'vzrsjndnlqbrrqdh',
        },
      },
      defaults: {
        from: '"No Reply" <tauheeddarekar786@gmail.com>',
      },
      template: {
        dir: join(__dirname, 'templates'),
        adapter: new HandlebarsAdapter(), // or any other adapter
        options: {
          strict: true,
        },
      },
    }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'sql12.freesqldatabase.com',
      port: 3306,
      username: 'sql12737926',
      password: 'Qxl3LfywAA',
      database: 'sql12737926',
      entities: [UserEntity, Expense],
      synchronize: true,
    }),    
  LoginModule,
  ChartModule,
  ExpenseModule,
  ConfigModule.forRoot(),
  JwtModule.register({
    secret: '5f83805a-01eb-47cd-b327-6697be859a88',
    signOptions: {expiresIn: '24h'}
  }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {} 