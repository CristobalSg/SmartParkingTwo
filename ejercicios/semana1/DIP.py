from abc import ABC, abstractmethod

# ===============================
# ESCENARIO 5 - DIP (Inversión de Dependencias)
# ===============================

# PROBLEMA: OrderService depende directamente de EmailSender (detalle concreto).
# Esto dificulta las pruebas y el cambio a otros sistemas de notificación.
# Viola DIP porque depende de detalles, no de abstracciones.

# SOLUCIÓN - Inversión de dependencias:


class Notifier(ABC):
    @abstractmethod
    def send_notification(self, to: str, message: str) -> None:
        pass


class EmailNotifier(Notifier):
    def send_notification(self, to: str, message: str) -> None:
        print(f"SMTP -> {to}: {message}")


class SMSNotifier(Notifier):
    def send_notification(self, to: str, message: str) -> None:
        print(f"SMS -> {to}: {message}")


class PushNotifier(Notifier):
    def send_notification(self, to: str, message: str) -> None:
        print(f"PUSH -> {to}: {message}")


class OrderService:
    def __init__(self, notifier: Notifier):
        self.notifier = notifier  # Dependencia inyectada

    def place_order(self, customer_contact: str, message: str) -> None:
        # ... lógica de procesamiento de orden ...
        print("Procesando orden...")
        self.notifier.send_notification(customer_contact, message)


def demo_dip():
    print("=== DEMO DIP ===")
    # Fácil intercambiar notificadores
    email_service = OrderService(EmailNotifier())
    sms_service = OrderService(SMSNotifier())
    push_service = OrderService(PushNotifier())

    email_service.place_order("user@test.com", "Gracias por su compra")
    sms_service.place_order("+1234567890", "Su orden está lista")
    push_service.place_order("device123", "Nueva oferta disponible")
    print()
