import { Module } from '@nestjs/common';
import { LoginService } from './login.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from 'src/entity/user.entity';
import { LoginController } from './login.controller';
import { MailerModule } from '@nestjs-modules/mailer';
import { SendGridService } from './sendgrid.service';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt'; 
import { JwtStrategy } from './jwt.strategy';

@Module({
    
  controllers: [LoginController],
  providers: [LoginService, SendGridService, ConfigService, JwtStrategy],
  imports: [
    TypeOrmModule.forFeature([UserEntity]),
    JwtModule.register({ // Register JwtModule with options
      secret: '5f83805a-01eb-47cd-b327-6697be859a88',
      signOptions: { expiresIn: '1h' },
    }),
  ],
})
export class LoginModule {}