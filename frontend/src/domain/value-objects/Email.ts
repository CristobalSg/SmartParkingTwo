export class Email {
  private readonly value: string;

  constructor(value: string) {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      throw new Error("Invalid email format");
    }
    this.value = value;
  }

  getValue() {
    return this.value;
  }
}
