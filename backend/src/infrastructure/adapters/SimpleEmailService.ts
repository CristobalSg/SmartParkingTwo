import { Injectable } from '@nestjs/common';
import * as SibApiV3Sdk from '@getbrevo/brevo';

@Injectable()
export class SimpleEmailService {
    private apiInstance: SibApiV3Sdk.TransactionalEmailsApi;

    constructor() {
        this.initializeBrevo();
    }

    private initializeBrevo() {
        // Configurar Brevo API
        this.apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

        // Configurar la autenticación con API key
        this.apiInstance.setApiKey(SibApiV3Sdk.TransactionalEmailsApiApiKeys.apiKey, process.env.BREVO_API_KEY);

        console.log('📧 Simple Email Service inicializado con Brevo API');
    }

    async sendLoginNotification(adminEmail: string, isFirstLogin: boolean): Promise<void> {
        const subject = isFirstLogin
            ? '🎉 Primer Login - Smart Parking System'
            : '🔐 Login Exitoso - Smart Parking System';

        const message = isFirstLogin
            ? `¡Bienvenido! Te has logueado por primera vez en Smart Parking System.`
            : `Login exitoso en Smart Parking System.`;

        const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

        sendSmtpEmail.subject = subject;
        sendSmtpEmail.htmlContent = `
            <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
                <h2 style="color: #2563eb;">🅿️ Smart Parking System</h2>
                <p><strong>${message}</strong></p>
                <p><strong>Tu email:</strong> ${adminEmail}</p>
                <p><strong>Fecha y Hora:</strong> ${new Date().toLocaleString('es-ES')}</p>
                <hr>
                <p style="color: #666; font-size: 12px;">
                    Esta es una notificación automática del sistema Smart Parking enviada a tu email personal.
                </p>
            </div>
        `;
        sendSmtpEmail.sender = {
            "name": "Smart Parking System",
            "email": process.env.BREVO_SENDER
        };
        sendSmtpEmail.to = [{
            "email": adminEmail
        }];

        try {
            await this.apiInstance.sendTransacEmail(sendSmtpEmail);
            console.log(`📧 Email enviado exitosamente a ${adminEmail}`);
        } catch (error) {
            console.error('❌ Error enviando email:', error);
            throw error;
        }
    }
}
