import { Order } from "../entity/order.entity";
import { OrderRepositoryTypeORM } from "../source/typeorm/order.repository.typeorm";

export interface OrderRepository {
  create(order: Order): Promise<Order>;
  update(id: number, data: Partial<Order>): Promise<Order>;
  get(id: number): Promise<Order | null>;
  getByTransactionId(transactionId: string): Promise<Order | null>;
  getCompletedOrders(): Promise<Order[]>;
}

export const getOrderRepository = (): OrderRepository => {
  return new OrderRepositoryTypeORM();
};
