import { errorMessages, otpLength, StatusCode } from "../../common/constant.js";
import { AuthenticatedUser, CreateUserInput, PublicUser, User } from "../../domain/entities/user.entity.js";
import { IUserRepository } from "../../domain/repositories/user.repository.js";
import { IEmailService } from "../../domain/services/email.service.js";
import { IPasswordService } from "../../domain/services/password.service.js";
import { ITokenService } from "../../domain/services/token.service.js";
import { toPublicUser } from "../../infrastructure/prisma/mappers.js";
import { ApiError } from "../../utils/ApiError.js";
import { generateDigitOTP } from "../utils/date.utils.js";
import {
  validateLoginFields,
  validateOtp,
  validateRegistrationFields,
  validateResendOtpInput,
  validateVerifyEmailInput,
} from "../../utils/validations/auth.validate.js";

export class AuthService {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly passwordService: IPasswordService,
    private readonly tokenService: ITokenService,
    private readonly emailService: IEmailService,
  ) {}

  async register(input: CreateUserInput): Promise<PublicUser> {
    validateRegistrationFields({
      fullName: input.fullName,
      email: input.email,
      password: input.password,
    });

    const existingUser = await this.userRepository.findBySerialNumberOrEmail(
      input.serialNumber,
      input.email,
    );
    if (existingUser) {
      throw new ApiError(StatusCode.CONFLICTS, errorMessages.userAlreadyExist);
    }

    const otp = generateDigitOTP(otpLength);
    const hashedPassword = await this.passwordService.hash(input.password);

    const user = await this.userRepository.create({
      ...input,
      password: hashedPassword,
      otp,
    });

    try {
      await this.emailService.sendOtpEmail(input.email, otp);
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.log(`[DEV] OTP for ${input.email}: ${otp}`);
      } else {
        throw error;
      }
    }

    return toPublicUser(user);
  }

  async login(email: string, password: string): Promise<{ token: string }> {
    validateLoginFields(email, password);

    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new ApiError(StatusCode.BADREQUEST, errorMessages.userNotExist);
    }

    const isMatch = await this.passwordService.compare(password, user.password);
    if (!isMatch) {
      throw new ApiError(StatusCode.UNAUTHORIZED, errorMessages.credentialsInvalid);
    }

    if (!user.isActive) {
      throw new ApiError(StatusCode.UNAUTHORIZED, errorMessages.emailNotVerified);
    }

    const token = this.tokenService.generateAccessToken(this.toAuthenticatedUser(user));
    return { token };
  }

  async verifyEmail(email: string, otp: string | number): Promise<{ alreadyVerified: boolean }> {
    validateVerifyEmailInput(email, otp);

    const user = await this.findUserByEmail(email);

    if (user.isEmailVerified) {
      return { alreadyVerified: true };
    }

    validateOtp(otp, user.otp ?? "");

    await this.userRepository.update(user.id, {
      isEmailVerified: true,
      otp: null,
    });

    return { alreadyVerified: false };
  }

  async resendOtp(email: string): Promise<void> {
    validateResendOtpInput(email);

    const user = await this.findUserByEmail(email);

    if (user.isEmailVerified) {
      throw new ApiError(StatusCode.BADREQUEST, errorMessages.emailAlreadyVerified);
    }

    const otp = generateDigitOTP(otpLength);
    await this.userRepository.update(user.id, { otp });
    await this.emailService.sendOtpEmail(email, otp);
  }

  async getAuthenticatedUser(token: string): Promise<AuthenticatedUser> {
    const { id } = this.tokenService.verifyAccessToken(token);
    const user = await this.userRepository.findById(id);

    if (!user) {
      throw new ApiError(StatusCode.UNAUTHORIZED, errorMessages.invalidToken);
    }

    return this.toAuthenticatedUser(user);
  }

  private async findUserByEmail(email: string): Promise<User> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new ApiError(StatusCode.BADREQUEST, errorMessages.userNotExist);
    }
    return user;
  }

  private toAuthenticatedUser(user: User): AuthenticatedUser {
    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      serialNumber: user.serialNumber,
      role: user.role,
      isEmailVerified: user.isEmailVerified,
      isActive: user.isActive,
    };
  }
}
