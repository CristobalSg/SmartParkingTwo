#!/usr/bin/env python3
"""
Demostración de los 5 principios SOLID con ejemplos prácticos.

Este módulo principal importa y ejecuta ejemplos de cada principio:
- SRP (Single Responsibility Principle)
- OCP (Open/Closed Principle)  
- LSP (Liskov Substitution Principle)
- ISP (Interface Segregation Principle)
- DIP (Dependency Inversion Principle)
"""

# Importamos las demos de cada principio SOLID
from SRP import demo_srp
from OCP import demo_ocp
from LSP import demo_lsp
from ISP import demo_isp
from DIP import demo_dip


def main():
    """
    Función principal que ejecuta las demostraciones de todos los principios SOLID.
    """
    print("=" * 50)
    print("DEMOSTRACIÓN DE LOS PRINCIPIOS SOLID")
    print("=" * 50)
    print()

    # Ejecutar demo de cada principio
    demo_srp()      # Single Responsibility Principle
    demo_ocp()      # Open/Closed Principle
    demo_lsp()      # Liskov Substitution Principle
    demo_isp()      # Interface Segregation Principle
    demo_dip()      # Dependency Inversion Principle

    print("=" * 50)
    print("DEMOS COMPLETADAS")
    print("=" * 50)


if __name__ == "__main__":
    main()
