import axios from "axios";
import { AuthRepository } from "../../domain/repositories/AuthRepository";

export class AuthRepositoryImpl implements AuthRepository {
  async login(email: string, password: string): Promise<void> {
    const response = await axios.post("/api/login", { email, password });
    return response.data;
  }
}
