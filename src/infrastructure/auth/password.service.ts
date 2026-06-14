import bcrypt from "bcrypt";
import { IPasswordService } from "../../domain/services/password.service.js";

export class PasswordService implements IPasswordService {
  async hash(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  async compare(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
}
