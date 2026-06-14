export interface IEmailService {
  sendOtpEmail(email: string, otp: number): Promise<void>;
}
