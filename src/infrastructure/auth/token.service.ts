import jwt from "jsonwebtoken";
import { AuthenticatedUser } from "../../domain/entities/user.entity.js";
import { ITokenService } from "../../domain/services/token.service.js";

export class TokenService implements ITokenService {
  verifyAccessToken(token: string): { id: string } {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET as string) as { id: string };
    return { id: decoded.id };
  }

  generateAccessToken(user: AuthenticatedUser): string {
    return jwt.sign(
      {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        serialNumber: user.serialNumber,
        role: user.role,
      },
      process.env.ACCESS_TOKEN_SECRET as string,
      { expiresIn: "1h" },
    );
  }
}
