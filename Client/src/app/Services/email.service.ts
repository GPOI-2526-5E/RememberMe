import { Injectable } from '@angular/core';
import emailjs from '@emailjs/browser';
import { environment } from '../../Environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EmailService {

  constructor() {
    if (!this.isDummyConfig()) {
      emailjs.init(environment.emailjsPublicKey);
    }
  }

  private isDummyConfig(): boolean {
    return !environment.emailjsPublicKey || environment.emailjsPublicKey === 'YOUR_PUBLIC_KEY';
  }

  /**
   * Invia email di verifica account dopo la registrazione
   */
  async sendVerificationEmail(toEmail: string, fullName: string, verificationUrl: string): Promise<void> {
    if (this.isDummyConfig()) {
      console.warn('✉️ [MOCK EMAIL] Verification Email to:', toEmail, 'Name:', fullName, 'URL:', verificationUrl);
      return;
    }
    try {
      await emailjs.send(environment.emailjsServiceId, environment.emailjsVerifyTemplateId, {
        to_email: toEmail,
        to_name: fullName,
        verification_url: verificationUrl,
      });
      console.log('Email di verifica inviata a:', toEmail);
    } catch (error) {
      console.error('Errore invio email di verifica:', error);
      throw error;
    }
  }

  /**
   * Invia email per il reset della password
   */
  async sendResetPasswordEmail(toEmail: string, fullName: string, resetUrl: string): Promise<void> {
    if (this.isDummyConfig()) {
      console.warn('✉️ [MOCK EMAIL] Reset Password Email to:', toEmail, 'Name:', fullName, 'URL:', resetUrl);
      return;
    }
    try {
      await emailjs.send(environment.emailjsServiceId, environment.emailjsResetTemplateId, {
        to_email: toEmail,
        to_name: fullName,
        reset_url: resetUrl,
      });
      console.log('Email di reset password inviata a:', toEmail);
    } catch (error) {
      console.error('Errore invio email reset password:', error);
      throw error;
    }
  }

  /**
   * Invia segnalazione problema alle email degli amministratori
   */
  async sendReportEmail(subject: string, message: string, fromEmail: string): Promise<void> {
    if (this.isDummyConfig()) {
      console.warn('✉️ [MOCK EMAIL] Report Email Subject:', subject, 'From:', fromEmail, 'Message:', message);
      return;
    }
    try {
      await emailjs.send(environment.emailjsServiceId, environment.emailjsReportTemplateId, {
        subject: subject,
        message: message,
        from_email: fromEmail || 'anonimo',
        to_email: 'i.cassano.2566@vallauri.edu, d.racca.3256@vallauri.edu',
      });
      console.log('Segnalazione inviata con successo');
    } catch (error) {
      console.error('Errore invio segnalazione:', error);
      throw error;
    }
  }
}
