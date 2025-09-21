export interface PasswordPolicy {

  validate(password: string): { valid: boolean; reason?: string };
}