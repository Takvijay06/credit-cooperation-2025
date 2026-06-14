import { emailMessages, EmptyValue } from "../../common/constant.js";
import { IEmailService } from "../../domain/services/email.service.js";
import { html, sendMail } from "../../utils/services/sendMail.js";

export class NodemailerEmailService implements IEmailService {
  async sendOtpEmail(email: string, otp: number): Promise<void> {
    await sendMail({
      to: email,
      subject: emailMessages.subject,
      text: emailMessages.getText(otp),
      html: html.replace(emailMessages.otpField, otp + EmptyValue),
    });
  }
}
