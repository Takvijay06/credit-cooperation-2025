import { createTransport } from "nodemailer";

const transporter = createTransport({
  service: process.env.EMAIL_PROVIDER ?? "gmail",
  auth: {
    user: process.env.SENDER_EMAIL ?? "takvijay06@gmail.com",
    pass: process.env.EMAIL_SECRET_KEY ?? "rkfw aeyv gite gydi",
  },
});

export const html = `
  <div style="font-family: Arial, sans-serif; background-color: #f5f7fa; padding: 20px;">
    <div style="max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
      <div style="padding: 30px; text-align: center;">
        <h2 style="color: #333333;">Welcome to Credit Co-operative Society</h2>
        <p style="color: #555555; font-size: 16px;">
          Thank you for registering. Please use the OTP below to verify your email address:
        </p>
        <div style="margin: 20px 0; font-size: 28px; font-weight: bold; color: #2d89ef;">
          {{OTP}}
        </div>
        <p style="color: #999999; font-size: 14px;">
          This OTP is valid for 10 minutes. If you did not initiate this request, please ignore this email.
        </p>
      </div>
      <div style="background-color: #f0f0f0; text-align: center; padding: 15px; font-size: 12px; color: #888888;">
        &copy; ${new Date().getFullYear()} Credit Co-operative Society. All rights reserved.
      </div>
    </div>
  </div>
`;

export const sendMail = async ({
  to,
  subject,
  text,
  html,
}: {
  to: string;
  subject: string;
  text: string;
  html?: string;
}) => {
  const mailOptions = {
    from: process.env.SENDER_EMAIL ?? "takvijay06@gmail.com",
    to,
    subject,
    text,
    html,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info.messageId);
    return info;
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};
