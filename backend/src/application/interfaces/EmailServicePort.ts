export interface EmailServicePort {
    sendLoginNotification(email: string, adminName: string, loginTime: Date): Promise<void>;
}
