import { AuthenticatedUser } from "../entities/user.entity.js";

export interface ITokenService {
  verifyAccessToken(token: string): { id: string };
  generateAccessToken(user: AuthenticatedUser): string;
}
