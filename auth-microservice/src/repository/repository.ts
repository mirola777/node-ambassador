export interface Repository<T> {
  get(id: string): Promise<T>;
  getAll(): Promise<T[]>;
  create(data: T): Promise<T>;
  update(id: string, data: T): Promise<T>;
  delete(id: string): Promise<T>;
}
