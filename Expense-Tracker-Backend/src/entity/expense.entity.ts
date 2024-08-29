import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { UserEntity } from './user.entity';
import { ApiProperty } from "@nestjs/swagger"; 

@Entity()
export class Expense {
    
    @ApiProperty({
        description: "The example",
        example: "Tauheed"
      })
    @PrimaryGeneratedColumn()
    expenseId: number;
 
    @ApiProperty()
    @Column()
    date: string;
 
    @ApiProperty()
    @Column()
    category: string;
 
    @ApiProperty()
    @Column()
    merchant: string;
 
    @ApiProperty()
    @Column({ type: 'float' })
    amount: number;
 
    @ApiProperty()
    @Column()
    paymentMode: string;
 
    @ApiProperty()
    @ManyToOne(() => UserEntity)
    @JoinColumn({ name: 'userId' })
    user: UserEntity; 
 
    @Column()
    userId: number;
}