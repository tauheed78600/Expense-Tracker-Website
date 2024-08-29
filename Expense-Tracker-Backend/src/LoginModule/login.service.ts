import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from 'src/entity/user.entity';
import { Repository } from 'typeorm';
import * as nodemailer from 'nodemailer';
import { SendGridService } from './sendgrid.service'; 
import * as bcrypt from 'bcrypt';
import { JwtService } from "@nestjs/jwt";
import { Expense } from 'src/entity/expense.entity';


@Injectable()
export class LoginService {

  private readonly tokenCache: {[key:string]: string} = {}

  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly sendGridService: SendGridService, 
    private readonly jwtService: JwtService,
  ) {}

  async updateUsername(userId: number, username: string,): Promise<any>
  {
    const user = await this.userRepository.findOne({ where: { userId: userId } });
    // user.email = email
    user.user_name = username
    try
    {await this.userRepository.save(user)}
    catch(Error )
    {
      throw new Error()
    }
    return user
  }

  async checkUsernameExists(username: string){
    const userByUsername = await this.userRepository.findOne({ where: { user_name: username } });
    return !!userByUsername 
  }

  async checkEmailExists(email: string)
  {
    const userByEmail = await this.userRepository.findOne({ where: { email } });
    return !!userByEmail;
  }


    async updateEmail(userId: number, email: string)
    {
      const user = await this.userRepository.findOne({ where: { userId: userId } });
      user.email = email
    // user.user_name = username
    try
    {await this.userRepository.save(user)}
    catch(Error )
    {
      throw new Error()
    }
    return user
    }

  async validateCredentials(username: string, password: string): Promise<any> {
    console.log("Inside validateCredentials of service class");
     
    // Trim the username to remove any leading or trailing whitespace
    username = username.trim();
     
    // Use the exact column name from the database
    const user = await this.userRepository.findOne({ where: { user_name: username } });
     
    console.log("user found or not", user);

    console.log("bcrypt  1234", await bcrypt.compare(password, user.password))
     console.log("user password in db", user.password)
    // if (user &&  password === user.password) 
    // {
    //   return user
    // }
    // Check if the user exists and the password matches
    if (user && await bcrypt.compare(password, user.password)) {
      return user;
    }
     
    // Return false if the user does not exist or the password does not match
    return false;
  }
  

  async checkUsernameOrEmailExists(username: string, email: string): Promise<boolean> {
    console.log("inside checkUsernameOrEmailExists")
    const userByUsername = await this.userRepository.findOne({ where: { user_name: username } });
    const userByEmail = await this.userRepository.findOne({ where: { email } });
    // console.log("userByEmail", userByEmail.email)
    // console.log("userByUsername", userByUsername.user_name)

    return !!userByUsername || !!userByEmail;
 }

  async registerUser(userEntity: UserEntity) {
    console.log("inside registerUser of service class");
    return await this.userRepository.save(userEntity);
  }

  async sendResetLink(email: string): Promise<void> {
    const user = await this.userRepository.findOne({ where: { email } });
    if (user) {
      const token = Math.random().toString(20).substring(2, 12);
      console.log("token", token)
      this.tokenCache[token] = email;
      const resetUrl = `http://localhost:3001/reset-password?token=${token}`;

      // Use SendGrid to send the email
      await this.sendGridService.send({
        to: email,
        from: 'Tdarekar@parkar.digital', 
        subject: 'Password Reset Request',
        text: `Click on the below Link to reset the password`,
        html: `<p>Click on the following link to reset your password:</p><a href="${resetUrl}">${resetUrl}</a>`,

      });
    } else {
      throw new NotFoundException('Email not found');
    }
  }

  async sendFeedback(email: string, fullName: string, message: string): Promise<void> {
      const user = await this.userRepository.findOne({ where: { email } });
      const token = Math.random().toString(20).substring(2, 12);
      console.log("token", token)
      this.tokenCache[token] = email;
      const resetUrl = `http://localhost:3001/reset-password?token=${token}`;

      // Use SendGrid to send the email
      await this.sendGridService.send({
        to: email,
        from: 'Tdarekar@parkar.digital', 
        subject: `Feedback from ${fullName}`,
        text: message,
      });
  }

  async sendEmailBudgetExceeded(email: string): Promise<void> {
    const user = await this.userRepository.findOne({ where: { email } });
    if (user) {
      const token = Math.random().toString(20).substring(2, 12);
      console.log("token", token)
      this.tokenCache[token] = email;
      const resetUrl = `http://localhost:3001/reset-password?token=${token}`;

      // Use SendGrid to send the email
      await this.sendGridService.send({
        to: email,
        from: 'Tdarekar@parkar.digital', 
        subject: 'Monthly Budget Goal Exceeded',
        text: `Dear User, Your monthly budget has been exceeded. Thank You`,
        
      });
    } else {
      throw new NotFoundException('Email not found');
    }
  }

  async sendEmailBudgetNineReached(email: string): Promise<void> {
    const user = await this.userRepository.findOne({ where: { email } });
    if (user) {
      const token = Math.random().toString(20).substring(2, 12);
      console.log("token", token)
      this.tokenCache[token] = email;
      const resetUrl = `http://localhost:3001/reset-password?token=${token}`;

      // Use SendGrid to send the email
      await this.sendGridService.send({
        to: email,
        from: 'Tdarekar@parkar.digital', 
        subject: 'Monthly Budget Goal 90% Reached',
        text: `Dear User, Your monthly budget you have reached 90% spending limit of your monthly budget. Thank You`,
      });
    } else {
      throw new NotFoundException('Email not found');
    }
  }

  async validateToken(token: string)
  {
    const email = this.tokenCache[token];
    if (!email)
    {
      throw new NotFoundException("Token validity expired!!");
    }
    delete this.tokenCache[token];
    return email;
  }

  async getEmailFromToken(token: string): Promise<string | undefined>
  {
      const email = this.tokenCache[token];
      delete this.tokenCache[token];
      return email;
  }

  async updatePassword(email: string, password: string) : Promise<void>
  {
      const user = await this.userRepository.findOne({where:{email}});
      if (!user){
        throw new NotFoundException("User not Found")
      }
      user.password = password;
      await this.userRepository.save(user);
  }

  async hashPassword(password: string): Promise<string>
  {
    const saltOfRounds = 10;
    return bcrypt.hash(password, saltOfRounds);
  }

  async login(user: any) {
    const payload = { email: user.email, sub: user.userId };
    const accessToken = this.jwtService.sign(payload);
    
    console.log("userId: user.userId",  user.userId)
    return {
      accessToken: accessToken,
      userId: user.userId, 
    };
  }

  async findOne(userId: number): Promise<UserEntity | undefined> {
    return this.userRepository.findOne({where:{userId}});
  }

}

  



  // 5f83805a-01eb-47cd-b327-6697be859a88    This is the jwt secret key