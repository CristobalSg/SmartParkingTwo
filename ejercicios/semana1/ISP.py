from abc import ABC, abstractmethod

# ===============================
# ESCENARIO 4 - ISP (Segregación de Interfaces)
# ===============================

# PROBLEMA: Worker es una interfaz "gorda" que fuerza a implementar
# métodos irrelevantes para ciertos tipos (como Robot.eat()).
# Esto viola ISP porque los clientes dependen de métodos que no usan.

# SOLUCIÓN - Interfaces segregadas:


class Workable(ABC):
    @abstractmethod
    def work(self) -> None:
        pass


class Eatable(ABC):
    @abstractmethod
    def eat(self) -> None:
        pass


class Attendee(ABC):
    @abstractmethod
    def attend_meeting(self) -> None:
        pass


class Human(Workable, Eatable, Attendee):
    def work(self) -> None:
        print("Trabajando...")

    def eat(self) -> None:
        print("Comiendo...")

    def attend_meeting(self) -> None:
        print("Asistiendo a reunión...")


class Robot(Workable):
    def work(self) -> None:
        print("Produciendo...")


class Manager(Workable, Eatable, Attendee):
    def work(self) -> None:
        print("Gestionando equipo...")

    def eat(self) -> None:
        print("Almorzando...")

    def attend_meeting(self) -> None:
        print("Dirigiendo reunión...")


def demo_isp():
    print("=== DEMO ISP ===")
    human = Human()
    robot = Robot()
    manager = Manager()

    # Cada uno implementa solo lo que necesita
    human.work()
    human.eat()

    robot.work()  # No necesita eat()

    manager.attend_meeting()
    print()
