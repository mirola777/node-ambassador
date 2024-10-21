import { User } from "../model/user.model";
import { Repository } from "./repository";

export class UserRepository implements Repository<User> {
  get(id: string): Promise<User> {
    throw new Error("Method not implemented.");
  }

  getAll(): Promise<User[]> {
    throw new Error("Method not implemented.");
  }

  create(data: User): Promise<User> {
    throw new Error("Method not implemented.");
  }

  update(id: string, data: User): Promise<User> {
    throw new Error("Method not implemented.");
  }

  delete(id: string): Promise<User> {
    throw new Error("Method not implemented.");
  }
}
