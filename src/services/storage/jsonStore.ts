export interface JsonStore<T> {
  get(defaultValue: T): T;
  update(value: T): Promise<void>;
}
