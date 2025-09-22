import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { EmailServicePort } from '../../application/interfaces/EmailServicePort';

@Injectable()
export class EmailServiceAdapter implements EmailServicePort {
    private transporter: nodemailer.Transporter;

    constructor() {
        this.initializeTransporter();
    }    private async initializeTransporter() {
        // 🎯 OPCIÓN SIMPLE: Mantener Ethereal para desarrollo
        // Los correos se pueden ver en: https://ethereal.email
        try {
            const testAccount = await nodemailer.createTestAccount();
            
            this.transporter = nodemailer.createTransport({
                host: 'smtp.ethereal.email',
                port: 587,
                secure: false,
                auth: {
                    user: testAccount.user,
                    pass: testAccount.pass
                }
            });
            
            console.log('📧 Email Adapter inicializado con Ethereal Email');
            console.log(`📮 Credenciales: ${testAccount.user}`);
            console.log('🔗 Para ver emails: https://ethereal.email');
            
        } catch (error) {
            console.error('❌ Error inicializando Email Adapter:', error);
            this.transporter = nodemailer.createTransport({
                streamTransport: true,
                newline: 'unix',
                buffer: true
            });
            console.log('📧 Email Adapter inicializado en modo fallback');
        }
    }

    async sendLoginNotification(email: string, adminName: string, loginTime: Date): Promise<void> {
        const mailOptions = {
            from: '"🅿️ Smart Parking System" <noreply@smartparking.com>',
            to: 'benjamintwo2002@gmail.com', // Tu email específico
            subject: '🔐 Notificación de Login - Smart Parking',
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <title>Notificación de Login</title>
                </head>
                <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                        <h1 style="color: white; margin: 0;">🅿️ Smart Parking</h1>
                        <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">Sistema de Gestión de Estacionamiento</p>
                    </div>
                    
                    <div style="background: white; padding: 30px; border: 1px solid #e0e0e0; border-radius: 0 0 10px 10px;">
                        <h2 style="color: #2c3e50; text-align: center;">🔐 Notificación de Inicio de Sesión</h2>
                        
                        <div style="background-color: #f8f9fa; padding: 20px; border-left: 4px solid #28a745; margin: 20px 0;">
                            <h3 style="color: #155724; margin: 0 0 15px 0;">✅ Login Exitoso</h3>
                            <p><strong>👤 Usuario:</strong> ${adminName}</p>
                            <p><strong>📧 Email:</strong> ${email}</p>
                            <p><strong>📅 Fecha y Hora:</strong> ${loginTime.toLocaleString('es-ES', {
                timeZone: 'America/Santiago',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            })}</p>
                            <p><strong>🏢 Sistema:</strong> Panel de Administración</p>
                        </div>
                        
                        <div style="background-color: #fff3cd; padding: 15px; border: 1px solid #ffeaa7; border-radius: 5px; margin: 20px 0;">
                            <p style="margin: 0; color: #856404;">
                                ⚠️ <strong>Aviso de Seguridad:</strong> Si no reconoces este login, contacta al soporte inmediatamente.
                            </p>
                        </div>
                        
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="http://localhost:3001" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 25px; text-decoration: none; border-radius: 25px; font-weight: bold;">
                                🚀 Ir al Dashboard
                            </a>
                        </div>
                        
                        <div style="text-align: center; padding: 20px; border-top: 1px solid #e0e0e0; margin-top: 30px;">
                            <p style="color: #6c757d; margin: 0; font-size: 14px;">
                                <strong>Equipo de Smart Parking</strong><br>
                                Sistema Universitario de Gestión de Estacionamiento
                            </p>
                            <p style="color: #adb5bd; margin: 10px 0 0 0; font-size: 12px;">
                                📧 Email automático generado por el Patrón Adapter<br>
                                🏗️ Arquitectura Hexagonal en acción
                            </p>
                        </div>
                    </div>
                </body>
                </html>
            `,
        };

        try {
            const info = await this.transporter.sendMail(mailOptions);
            console.log('🎉 ¡Email de login enviado exitosamente!');
            console.log(`📧 Destinatario: benjamintwo2002@gmail.com`);
            console.log(`👤 Admin: ${adminName}`);
            console.log(`📨 Message ID: ${info.messageId}`);

            // Si usamos Ethereal, mostrar URL de preview
            if (info.messageId && nodemailer.getTestMessageUrl) {
                const previewUrl = nodemailer.getTestMessageUrl(info);
                if (previewUrl) {
                    console.log(`🔗 Preview URL: ${previewUrl}`);
                }
            }

            console.log('✅ Patrón Adapter funcionando correctamente');
        } catch (error) {
            console.error('❌ Error enviando email:', error);
            // En modo fallback, al menos loggeamos que se intentó enviar
            console.log('📋 Email simulado enviado a benjamintwo2002@gmail.com');
            console.log(`👤 Usuario: ${adminName} se logueó en ${loginTime}`);
        }
    }
}
