import { AuthenticatedUser } from "../domain/entities/user.entity.js";

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export {};
