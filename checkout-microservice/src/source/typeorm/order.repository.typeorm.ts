import { getRepository } from "typeorm";
import { Order } from "../../entity/order.entity";
import { OrderRepository } from "../../repository/order.repository";

export class OrderRepositoryTypeORM implements OrderRepository {
  create(order: Order): Promise<Order> {
    const repository = getRepository(Order);

    return repository.save(order);
  }

  get(orderId: number): Promise<Order | null> {
    const repository = getRepository(Order);

    return repository.findOne(orderId);
  }

  getByTransactionId(transactionId: string): Promise<Order | null> {
    const repository = getRepository(Order);

    return repository.findOne({ transaction_id: transactionId });
  }

  async update(id: number, data: Partial<Order>): Promise<Order> {
    const repository = getRepository(Order);

    await repository.update(id, data);

    return await repository.findOne(id);
  }

  getCompletedOrders(): Promise<Order[]> {
    const repository = getRepository(Order);

    return repository.find({
      where: { complete: true },
      relations: ["order_items"],
    });
  }
}
