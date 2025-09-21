import { PasswordPolicy } from './PasswordPolicy';

export class StrongPasswordPolicy implements PasswordPolicy {
  private minLength = 7;
  private upper = /[A-Z]/;
  private lower = /[a-z]/;
  private digit = /[0-9]/;
  private special = /[\W_]/;

  validate(password: string) {
    if (!password || password.length < this.minLength) {
      return { valid: false, reason: `Password must be at least ${this.minLength} characters` };
    }
    if (!this.upper.test(password)) return { valid: false, reason: 'Password must include an uppercase letter' };
    if (!this.lower.test(password)) return { valid: false, reason: 'Password must include a lowercase letter' };
    if (!this.digit.test(password)) return { valid: false, reason: 'Password must include a digit' };
    if (!this.special.test(password)) return { valid: false, reason: 'Password must include a special character' };
    return { valid: true };
  }
}
