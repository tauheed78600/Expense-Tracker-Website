import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { ApiProperty } from "@nestjs/swagger"; 
 
@Entity()
export class UserEntity {

  @ApiProperty({
    description: "The example",
    example: "Tauheed"
  })
  @PrimaryGeneratedColumn()
  userId: number;

  @ApiProperty()
  @Column()
  // @PrimaryGeneratedColumn()
  email: string;
 
  @ApiProperty()
  @Column()
  password: string;
 
  @ApiProperty()
  @Column()
  // @PrimaryGeneratedColumn()
  user_name: string;

  @ApiProperty()
  @Column({ type: 'float' })
  monthly_budget: number;

  @ApiProperty()
  @Column({ type: 'float' })
  remaining_budget: number
 
  
}