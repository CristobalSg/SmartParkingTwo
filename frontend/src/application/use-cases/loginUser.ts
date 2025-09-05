import { Email } from "../../domain/value-objects/Email";
import { Password } from "../../domain/value-objects/Password";
import { AuthRepository } from "../../domain/repositories/AuthRepository";

export class LoginUser {
  constructor(private authRepository: AuthRepository) {}

  async execute(email: string, password: string) {
    const emailVO = new Email(email);
    const passwordVO = new Password(password);

    return this.authRepository.login(emailVO.getValue(), passwordVO.getValue());
  }
}
