import { PasswordPolicy } from './PasswordPolicy';

export class SimplePasswordPolicy implements PasswordPolicy {
  private minLength = 6;

  validate(password: string) {
    if (!password || password.length < this.minLength) {
      return { valid: false, reason: `Password must be at least ${this.minLength} characters` };
    }
    return { valid: true };
  }
}