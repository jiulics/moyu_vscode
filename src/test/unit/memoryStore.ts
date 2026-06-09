export class MemoryJsonStore<T> {
  private value: T | undefined;

  constructor(initialValue?: T) {
    this.value = initialValue;
  }

  get(defaultValue: T): T {
    return this.value ?? defaultValue;
  }

  update(value: T): Promise<void> {
    this.value = value;
    return Promise.resolve();
  }
}
