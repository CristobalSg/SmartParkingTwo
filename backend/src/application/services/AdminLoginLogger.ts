import { AuthenticationObserver } from '../../core/domain/events/AuthenticationEventEmitter';
import { Admin } from '../../core/domain/entities/Admin';

export class AdminLoginLogger implements AuthenticationObserver {
    onAdminLogin(admin: Admin): void {
        console.log(`Admin ${admin.name} logged in at ${new Date().toISOString()}`);
    }
}