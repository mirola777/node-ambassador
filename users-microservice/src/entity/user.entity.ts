import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity()
export class User {
  @PrimaryColumn()
  id: string;

  @Column()
  first_name: string;

  @Column()
  last_name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  is_ambassador: boolean;

  get name(): string {
    return this.first_name + " " + this.last_name;
  }
}
