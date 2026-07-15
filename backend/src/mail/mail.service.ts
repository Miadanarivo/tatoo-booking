import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(private readonly mailerService: MailerService) {}

  /**
   * Envoie un code de vérification lors de l'inscription
   */
  async sendVerificationCode(
    to: string,
    firstName: string,
    code: string,
  ): Promise<void> {
    try {
      await this.mailerService.sendMail({
        to,
        subject: 'Confirmez votre inscription - Tattoo Booking',
        html: `
          <div style="font-family: Arial, sans-serif;">
            <h2>Bonjour ${firstName} 👋</h2>
            <p>Merci de vous être inscrit sur <strong>Tattoo Booking</strong>.</p>
            <p>Voici votre code de vérification :</p>
            <h1 style="letter-spacing: 5px;">${code}</h1>
            <p>Ce code expire dans 15 minutes.</p>
          </div>
        `,
      });
      this.logger.log(`Code de vérification envoyé à ${to}`);
    } catch (error) {
      this.logger.error(`Échec envoi email de vérification à ${to}`, error);
      throw error;
    }
  }

  /**
   * Envoie une confirmation de réservation
   */
  async sendBookingConfirmation(
    to: string,
    firstName: string,
    artistName: string,
    date: string,
    time: string,
  ): Promise<void> {
    try {
      await this.mailerService.sendMail({
        to,
        subject: 'Votre réservation est confirmée !',
        html: `
          <div style="font-family: Arial, sans-serif;">
            <h2>Bonjour ${firstName} 🎉</h2>
            <p>Votre réservation avec <strong>${artistName}</strong> est confirmée pour le ${date} à ${time}.</p>
          </div>
        `,
      });
      this.logger.log(`Confirmation de réservation envoyée à ${to}`);
    } catch (error) {
      this.logger.error(`Échec envoi confirmation à ${to}`, error);
      throw error;
    }
  }

  /**
   * Envoie un email de rejet de réservation
   */
  async sendBookingRejected(
    to: string,
    firstName: string,
    artistName: string,
    reason?: string,
  ): Promise<void> {
    try {
      await this.mailerService.sendMail({
        to,
        subject: 'Votre demande de réservation a été refusée',
        html: `
          <div style="font-family: Arial, sans-serif;">
            <h2>Bonjour ${firstName}</h2>
            <p>Votre demande de réservation avec <strong>${artistName}</strong> a été refusée.</p>
            <p>Raison : ${reason || 'Non spécifié'}</p>
          </div>
        `,
      });
      this.logger.log(`Email de refus envoyé à ${to}`);
    } catch (error) {
      this.logger.error(`Échec envoi refus à ${to}`, error);
      throw error;
    }
  }

  /**
   * Envoie un email générique (utile pour tests ou notifications diverses)
   */
  async sendGenericEmail(
    to: string,
    subject: string,
    text: string,
  ): Promise<void> {
    try {
      await this.mailerService.sendMail({
        to,
        subject,
        text,
      });
      this.logger.log(`Email générique envoyé à ${to}`);
    } catch (error) {
      this.logger.error(`Échec envoi email générique à ${to}`, error);
      throw error;
    }
  }
}