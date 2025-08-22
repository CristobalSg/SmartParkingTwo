from abc import ABC, abstractmethod

# ===============================
# ESCENARIO 3 - LSP (Sustitución de Liskov)
# ===============================

# PROBLEMA: Square hereda de Rectangle pero cambia el comportamiento esperado.
# Los clientes esperan que set_width y set_height sean independientes,
# pero Square los acopla, rompiendo la sustituibilidad.

# SOLUCIÓN - Abstracción apropiada:


class Shape(ABC):
    @abstractmethod
    def area(self) -> float:
        pass

    @abstractmethod
    def perimeter(self) -> float:
        pass


class Rectangle(Shape):
    def __init__(self, width: float, height: float):
        self._width = width
        self._height = height

    def set_width(self, width: float) -> None:
        self._width = width

    def set_height(self, height: float) -> None:
        self._height = height

    def area(self) -> float:
        return self._width * self._height

    def perimeter(self) -> float:
        return 2 * (self._width + self._height)

    @property
    def width(self) -> float:
        return self._width

    @property
    def height(self) -> float:
        return self._height


class Square(Shape):
    def __init__(self, side: float):
        self._side = side

    def set_side(self, side: float) -> None:
        self._side = side

    def area(self) -> float:
        return self._side * self._side

    def perimeter(self) -> float:
        return 4 * self._side

    @property
    def side(self) -> float:
        return self._side

# Función que trabaja con la abstracción correcta


def compute_shape_area(shape: Shape) -> float:
    return shape.area()

# Función específica para rectángulos que necesita dimensiones independientes


def compute_rectangle_with_dimensions(width: float, height: float) -> float:
    rect = Rectangle(width, height)
    return rect.area()


def demo_lsp():
    print("=== DEMO LSP ===")
    rectangle = Rectangle(5, 10)
    square = Square(5)

    print(f"Área rectángulo: {compute_shape_area(rectangle)}")
    print(f"Área cuadrado: {compute_shape_area(square)}")
    print(
        f"Área rectángulo con dimensiones específicas: {compute_rectangle_with_dimensions(5, 10)}")
    print()
