import { Controller, Get, Param, Res, HttpException, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { ChartService } from './chart.service';

@Controller('api')
export class ChartController {
  constructor(private readonly chartService: ChartService) {}

  @Get('data/:userId')
  async getData(@Param('userId') userId: number, @Res() res: Response) {
    try {
        // console.log("data",)
      const results = await this.chartService.getExpensesByCategory(userId);
      console.log("data", results)
      res.json(results);
    } catch (error) {
      throw new HttpException('Error fetching data', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('data1/:userId')
  async getData1(@Param('userId') userId: number, @Res() res: Response) {
    try {
        // console.log("data1",)
      const results = await this.chartService.getExpensesByMerchant(userId);
      console.log("data1", results)
      res.json(results);
    } catch (error) {
      throw new HttpException('Error fetching data', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('data2/:userId')
  async getData2(@Param('userId') userId: number, @Res() res: Response) {
    try {
        // console.log("data2",)
      const results = await this.chartService.getExpensesByPaymentMode(userId);
      console.log("data2", results)
      res.json(results);
    } catch (error) {
      throw new HttpException('Error fetching data', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('data3/:userId')
  async getData3(@Param('userId') userId: number, @Res() res: Response) {
    try {
        // console.log("data3",)
      const results = await this.chartService.getExpensesByPaymentMode(userId);
      console.log("data3", results)
      res.json(results);
    } catch (error) {
      throw new HttpException('Error fetching data', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}

