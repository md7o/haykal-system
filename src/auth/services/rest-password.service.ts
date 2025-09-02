import { Injectable, Logger } from '@nestjs/common';
import * as Brevo from '@getbrevo/brevo';

@Injectable()
export class ResetPasswordService {
  private apiInstance: Brevo.TransactionalEmailsApi;
  private readonly logger = new Logger(ResetPasswordService.name);

  constructor() {
    this.apiInstance = new Brevo.TransactionalEmailsApi();
    this.apiInstance.setApiKey(
      Brevo.TransactionalEmailsApiApiKeys.apiKey,
      process.env.BREVO_API_KEY ?? '',
    );
  }

  async sendOtpEmail(to: string, otpCode: string): Promise<void> {
    const html = `
      <div style="font-family: Arial, sans-serif; text-align: center; padding: 40px;">
        <h2 style="color: #333;">Reset Your Password</h2>
        <p style="font-size: 16px; color: #555;">
          Use the code below to reset your password. It expires in 10 minutes.
        </p>

        <div style="
          display: inline-block;
          margin: 20px auto;
          padding: 20px 40px;
          font-size: 32px;
          font-weight: bold;
          letter-spacing: 8px;
          color: #222;
          border: 2px solid #FFAD86;
          border-radius: 8px;
          background-color: #f9f9f9;
        ">
          ${otpCode}
        </div>

        <p style="font-size: 14px; color: #888;">
          If you did not request a password reset, you can ignore this email.
        </p>
      </div>
    `;
    const email = new Brevo.SendSmtpEmail();
    email.sender = {
      name: process.env.SENDER_NAME || 'Haykal',
      email: process.env.SENDER_EMAIL || 'md7ohe@gmail.com',
    };
    email.to = [{ email: to }];
    email.subject = 'Your Password Reset Code';
    email.htmlContent = html;
    email.textContent = `Your password reset code is ${otpCode}`;
    try {
      await this.apiInstance.sendTransacEmail(email);
    } catch (error) {
      const msg =
        typeof error === 'object' && error !== null
          ? JSON.stringify(error)
          : String(error);
      this.logger.error(`Failed to send verification email to ${to}: ${msg}`);
      throw error;
    }
  }
}
