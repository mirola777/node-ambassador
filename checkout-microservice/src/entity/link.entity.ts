import {
  Column,
  Entity,
  JoinColumn,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Order } from "./order.entity";

@Entity()
export class Link {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  code: string;

  @Column()
  user_id: string;

  @Column("simple-array")
  products: string[];

  @OneToMany(() => Order, (order) => order.link, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({
    referencedColumnName: "code",
    name: "code",
  })
  orders: Order[];
}
