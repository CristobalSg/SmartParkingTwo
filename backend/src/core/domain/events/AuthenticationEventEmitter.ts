import { Admin } from '../entities/Admin';

export interface AuthenticationObserver {
  onAdminLogin(admin: Admin): void;
}

export class AuthenticationEventEmitter {
  private observers: AuthenticationObserver[] = [];

  addObserver(observer: AuthenticationObserver): void {
    this.observers.push(observer);
  }

  notifyAdminLogin(admin: Admin): void {
    this.observers.forEach((observer) => observer.onAdminLogin(admin));
  }
}