export class Password {
  private readonly value: string;

  constructor(value: string) {
    if (value.length < 6) {
      throw new Error("Password must be at least 6 characters");
    }
    this.value = value;
  }

  getValue() {
    return this.value;
  }
}
