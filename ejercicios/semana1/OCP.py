import json
from datetime import datetime
from abc import ABC, abstractmethod
from typing import Dict, Any

# ===============================
# ESCENARIO 2 - OCP (Abierto/Cerrado)
# ===============================

# PROBLEMA: PaymentProcessor tiene un if-elif que requiere modificación
# del código fuente para agregar nuevos tipos de pago.
# Esto viola OCP porque no está cerrado para modificación.

# SOLUCIÓN - Patrón Estrategia:


class PaymentMethod(ABC):
    @abstractmethod
    def process_payment(self, amount: float) -> None:
        pass


class CashPayment(PaymentMethod):
    def process_payment(self, amount: float) -> None:
        print(f"Efectivo: {amount}")


class CardPayment(PaymentMethod):
    def process_payment(self, amount: float) -> None:
        print(f"Tarjeta: {amount}")


class TransferPayment(PaymentMethod):
    def process_payment(self, amount: float) -> None:
        print(f"Transferencia: {amount}")

# Fácil extensión sin modificar código existente


class CryptoPayment(PaymentMethod):
    def process_payment(self, amount: float) -> None:
        print(f"Criptomoneda: {amount}")


class PaymentProcessor:
    def __init__(self):
        self.payment_methods = {
            "cash": CashPayment(),
            "card": CardPayment(),
            "transfer": TransferPayment(),
            "crypto": CryptoPayment()
        }

    def process(self, payment_type: str, amount: float) -> None:
        if payment_type not in self.payment_methods:
            raise ValueError(f"Tipo de pago '{payment_type}' no soportado")

        payment_method = self.payment_methods[payment_type]
        payment_method.process_payment(amount)


def demo_ocp():
    print("=== DEMO OCP ===")
    processor = PaymentProcessor()
    processor.process("card", 100.0)
    processor.process("crypto", 50.0)  # Fácil agregar nuevos tipos
    print()
