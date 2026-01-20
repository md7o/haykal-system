import { Injectable, Logger } from '@nestjs/common';
import * as Brevo from '@getbrevo/brevo';

@Injectable()
export class VerificationService {
  private readonly logger = new Logger(VerificationService.name);
  private emailApi: Brevo.TransactionalEmailsApi;

  constructor() {
    this.emailApi = new Brevo.TransactionalEmailsApi();
    if (!process.env.BREVO_API_KEY) {
      this.logger.warn('BREVO_API_KEY is not set. Email sending will fail.');
    }
  }

  async sendOtpVerification(to: string, otpCode: string): Promise<void> {
    const html = `
      <div style="font-family: Arial, sans-serif; text-align: center; padding: 40px;">
        <h2 style="color: #333;">Email Verification</h2>
        <p style="font-size: 16px; color: #555;">
          Use the code below to verify your email. The code will expire in 10 minutes.
        </p>

        <div style="
          display: inline-block;
          margin: 20px auto;
          padding: 20px 40px;
          font-size: 32px;
          font-weight: bold;
          letter-spacing: 8px;
          color: #222;
          border: 2px solid #4CAF50;
          border-radius: 8px;
          background-color: #f9f9f9;
        ">
          ${otpCode}
        </div>

        <p style="font-size: 14px; color: #888;">
          If you did not request this verification, you can safely ignore this email.
        </p>
      </div>
    `;
    const email = new Brevo.SendSmtpEmail();
    email.sender = {
      name: process.env.SENDER_NAME || 'Haykal',
      email: process.env.SENDER_EMAIL || 'md7ohe@gmail.com',
    };
    email.to = [{ email: to }];
    email.subject = 'Your Email Verification Code';
    email.htmlContent = html;
    email.textContent = `Your verification code is ${otpCode}`;
    try {
      // Set the API key before each request
      this.emailApi.setApiKey(Brevo.TransactionalEmailsApiApiKeys.apiKey, process.env.BREVO_API_KEY || '');
      await this.emailApi.sendTransacEmail(email);
      this.logger.log(`Verification email sent to ${to}`);
    } catch (error) {
      const msg = typeof error === 'object' && error !== null ? JSON.stringify(error) : String(error);
      this.logger.error(`Failed to send verification email to ${to}: ${msg}`);

      // Log detailed error information
      if (error instanceof Error) {
        this.logger.error(`Error name: ${error.name}`);
        this.logger.error(`Error message: ${error.message}`);
        this.logger.error(`Stack: ${error.stack}`);
      }

      throw error;
    }
  }
}
