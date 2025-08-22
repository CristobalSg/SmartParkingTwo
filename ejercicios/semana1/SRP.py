
# ===============================
# ESCENARIO 1 - SRP (Responsabilidad Única)
# ===============================

# PROBLEMA: ReportManager tiene múltiples responsabilidades:
# 1. Cargar datos
# 2. Formatear datos
# 3. Persistir en archivo
# 4. Mostrar en consola
# Esto viola SRP porque hay múltiples motivos de cambio.

# SOLUCIÓN - Separación de responsabilidades:

import json
from datetime import datetime
from abc import ABC, abstractmethod
from typing import Dict, Any

# Responsabilidad 1: Cargar datos


class DataSource:
    def load_data(self) -> Dict[str, Any]:
        return {"ventas": 1200, "fecha": str(datetime.now())}

# Responsabilidad 2: Formatear datos


class ReportFormatter:
    def format(self, data: Dict[str, Any]) -> str:
        return f"REPORTE: ventas={data['ventas']} fecha={data['fecha']}"

# Responsabilidad 3: Salida (abstracción para diferentes tipos)


class OutputHandler(ABC):
    @abstractmethod
    def output(self, content: str) -> None:
        pass


class FileOutput(OutputHandler):
    def __init__(self, filename: str):
        self.filename = filename

    def output(self, content: str) -> None:
        with open(self.filename, "w", encoding="utf-8") as f:
            f.write(content)


class ConsoleOutput(OutputHandler):
    def output(self, content: str) -> None:
        print(content)

# Servicio orquestador


class ReportService:
    def __init__(self, data_source: DataSource, formatter: ReportFormatter, outputs: list[OutputHandler]):
        self.data_source = data_source
        self.formatter = formatter
        self.outputs = outputs

    def generate_report(self) -> None:
        data = self.data_source.load_data()
        formatted_report = self.formatter.format(data)

        for output in self.outputs:
            output.output(formatted_report)


def demo_srp():
    print("=== DEMO SRP ===")
    data_source = DataSource()
    formatter = ReportFormatter()
    outputs = [
        FileOutput("reporte.txt"),
        ConsoleOutput()
    ]

    report_service = ReportService(data_source, formatter, outputs)
    report_service.generate_report()
    print()
