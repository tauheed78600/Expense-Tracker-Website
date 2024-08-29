import { Body, Controller, Get, NotFoundException, Param, Post, Put, Query, Res, Req, UnauthorizedException, UseGuards, HttpException, HttpStatus} from '@nestjs/common';
import { LoginService } from './login.service';
import { UserEntity } from 'src/entity/user.entity';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'; 
import { CreateUserDto } from 'src/dto/createUser.dto';
import { AuthGuard } from '@nestjs/passport';
import { JwtService } from "@nestjs/jwt";
import { Response } from 'express'
import { JwtAuthGuard } from './jwt-auth.guard';


@ApiTags('total')
@Controller('total')
export class LoginController  
{
      constructor(private readonly loginService: LoginService,  
                  private readonly jwtService: JwtService){}
       
      @ApiOperation({
        summary: 'Verify Login Details',
        description: 'This endpoint allows verifying the users credentials and generate token',
      })
      @Post("login")
      async login( @Query('username') username: string, @Query('password') password: string): Promise<any>{
        console.log("Inside Login functionality");
        
        console.log(password)
        console.log(username)

        const user = await this.loginService.validateCredentials(username, password);
        console.log("user in login", user)
        if (!user) {
          throw new UnauthorizedException("Invalid Credentials")
        }
        const loginResponse = this.loginService.login(user);
        return loginResponse;
      }

      @ApiOperation({
        summary: 'Register User',
        description: 'This endpoint allows Registration of user',
      })
      @Post("/register")
      async register(@Body() createUserdto: CreateUserDto) {
          const exists = await this.loginService.checkUsernameOrEmailExists(createUserdto.username, createUserdto.email);
          console.log("exists", exists)
          if (exists) {
            console.log("inside exists condition")
            return { status: 400, message: 'Username and email are already available' };
          }
          // Hash the password and wait for the promise to resolve
          const hashedPassword = await this.loginService.hashPassword(createUserdto.password);

          // Update the userEntity with the hashed password
          createUserdto.password = hashedPassword;
          const userEntity = new UserEntity();
          userEntity.email = createUserdto.email;
          userEntity.password = hashedPassword;
          userEntity.user_name = createUserdto.username; // Make sure this matches the property name in UserEntity
          userEntity.monthly_budget = createUserdto.monthlyBudget;
          userEntity.remaining_budget = createUserdto.monthlyBudget;

          // Save the updated userEntity to the database
          return this.loginService.registerUser(userEntity);
        }

        @ApiOperation({
          summary: 'Forgot Password',
          description: 'This endpoint allows user to change password if it forgots it',
        })
        @Post("forgotPassword")
        async forgotpassword(@Body('email') email: string)
        {
          console.log("email", email)
          console.log("inside forgot password")
          await this.loginService.sendResetLink(email);
          return { message: 'Check your email for the reset link.' };
        }  

        @ApiOperation({
          summary: 'Feedback form',
          description: 'This endpoint allows user to give feedback about the system',
        })
        @Post("feedback")
        async sendFeedback(@Query('fullName') fullName: string, @Query('message') message: string)
        {
            console.log("fullName", fullName)
            console.log("message", message)
            console
            console.log("Inside feedback functionality")
            var email = "Tdarekar@parkar.digital"
            await this.loginService.sendFeedback(email, fullName, message);
            return { message: 'Feedback sent Successfully' };
        }
         
        @ApiOperation({
          summary: 'Email for 90% budget exceeded',
          description: 'This endpoint sends email to the user if it has reached 90% of the monthly budget',
        })
        @ApiBearerAuth('JWT-auth')
        @UseGuards(AuthGuard('jwt'))
        @Post("send-email/budget-goal-nineReached")
        async sendEmail(@Body('token') token: string)
        {
          console.log("email", token)
          const decodedToken = this.jwtService.decode(token)
          await this.loginService.sendEmailBudgetNineReached(decodedToken.email)
          return { message: 'Budget goal has been 90% reached' };
        }

        @ApiOperation({
          summary: 'Email for monthly budget exceeded',
          description: 'This endpoint sends email to the user if it has reached the monthly budget limit',
        })
        @ApiBearerAuth()
        @UseGuards(AuthGuard('jwt'))
        @Post("send-email/budget-exceeded")
        async sendEmailExceeded(@Body('token') token: string)
        {
          console.log("send-email/budget-exceeded")
          const decodedToken = this.jwtService.decode(token)
          await this.loginService.sendEmailBudgetExceeded(decodedToken.email)
          return { message: 'Budget goal has been exceeded' };
        }

      @ApiOperation({
        summary: 'Update Username',
        description: 'This endpoint updates the username if the user wants to',
      })
      @ApiBearerAuth('JWT-auth')
      @UseGuards(AuthGuard('jwt'))
      @Put("/updateUsername")
      async updateUsername(@Query("token") token: string, @Query("username") username: string): Promise<any>      {
        
        const exists = await this.loginService.checkUsernameExists(username);
        
          if (exists)
          {
            // console.log("inside exists condition")
            return { status: 400, message: 'Username is already available' };
          }
          else{
            const decodedToken = this.jwtService.decode(token)
            await this.loginService.updateUsername(decodedToken.sub, username)
            return {status: 200, message: 'Username or Email updated'}
          }
      }

      @ApiOperation({
        summary: 'Update Email',
        description: 'This endpoint updates the email if the user wants to',
      })
      @ApiBearerAuth('JWT-auth')
      @UseGuards(AuthGuard('jwt'))
      @Put("/updateEmail")
      async updateEmail(@Query("token") token: string, @Query("email") email: string): Promise<any>{
        console.log("inside updateEmail functionality")
        const exists = await this.loginService.checkEmailExists(email);
        // console.log("username", username)
        console.log("email", email)
        console.log("exists", exists)
          if (exists)
          {
            // console.log("inside exists condition")
            return { status: 400, message: 'Email is already available' };
          }
          else{
            const decodedToken = this.jwtService.decode(token)
            // console.log("this.loginService.updateEmail(decodedToken.sub, email)", await this.loginService.updateEmail(decodedToken.sub, email))
            await this.loginService.updateEmail(decodedToken.sub, email)
            return {status: 200, message: 'Username or Email updated'}
          }
      }

      @ApiOperation({
        summary: 'Search user',
        description: 'This endpoint searches for the user in the database and returns it if present',
      })
      @ApiBearerAuth('JWT-auth')
      @UseGuards(AuthGuard('jwt'))
      @Get(':token')
      async findOne(@Param('token') token: string): Promise<UserEntity> {
        // console.log("userId in expenses", token)
        const decodedToken = this.jwtService.decode(token)
        const user = await this.loginService.findOne(decodedToken.sub);
        
        if (!user) 
        {
          throw new NotFoundException('User not found');
        }
        return user;
      }

      @ApiOperation({
        summary: 'Search user',
        description: 'This endpoint searches for the user in the database and returns it if present',
      })
      @ApiBearerAuth('JWT-auth')
      @UseGuards(AuthGuard('jwt'))
      @Get("/getUser/:token")
      async getUserById(@Param('token') token: string): Promise<UserEntity>
      {

        // console.log("inside getUser")
        const decodedToken = this.jwtService.decode(token)
        // console.log("decodenToken", decodedToken)
        const user = await this.loginService.findOne(decodedToken.sub)
        return user
      }

      @ApiOperation({
        summary: 'Reset password',
        description: 'This endpoint updates the new Password with the current password once user changes it',
      })
      @Post("/resetPassword")
      async resetPassword(
        @Body('token') token: string,
        @Body('password') password: string
      ) {
        console.log("Inside Reset Password API");
        console.log(token);
        const userEmail = await this.loginService.getEmailFromToken(token);
        console.log("userEmail", userEmail)
        if (!userEmail) {
          throw new NotFoundException("Invalid token or token expired");
        }
        const hashedPassword = await this.loginService.hashPassword(password);
        await this.loginService.updatePassword(userEmail, hashedPassword);
        return { message: "Password reset successful" };
      }

}