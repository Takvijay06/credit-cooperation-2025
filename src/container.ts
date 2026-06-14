import { FinancialCalculator } from "./application/financial/calculator.js";
import { AuthService } from "./application/services/auth.service.js";
import { FinancialEntryService } from "./application/services/financial-entry.service.js";
import { UserService } from "./application/services/user.service.js";
import { PasswordService } from "./infrastructure/auth/password.service.js";
import { TokenService } from "./infrastructure/auth/token.service.js";
import { NodemailerEmailService } from "./infrastructure/email/nodemailer.service.js";
import { prisma } from "./infrastructure/prisma/client.js";
import { PrismaFinancialEntryRepository } from "./infrastructure/repositories/financial-entry.repository.js";
import { PrismaFinancialYearRepository } from "./infrastructure/repositories/financial-year.repository.js";
import { PrismaUserRepository } from "./infrastructure/repositories/user.repository.js";

const userRepository = new PrismaUserRepository(prisma);
const financialYearRepository = new PrismaFinancialYearRepository(prisma);
const financialEntryRepository = new PrismaFinancialEntryRepository(prisma);

const passwordService = new PasswordService();
const tokenService = new TokenService();
const emailService = new NodemailerEmailService();
const financialCalculator = new FinancialCalculator();

export const authService = new AuthService(
  userRepository,
  passwordService,
  tokenService,
  emailService,
);

export const userService = new UserService(userRepository);

export const financialEntryService = new FinancialEntryService(
  userRepository,
  financialYearRepository,
  financialEntryRepository,
  financialCalculator,
);

export { prisma };
