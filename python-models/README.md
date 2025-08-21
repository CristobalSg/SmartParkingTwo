# Python Models API - Sistema de Detección IA para Estacionamiento

Servicio de inteligencia artificial para detección de vehículos, reconocimiento de patentes y análisis de ocupación de espacios de estacionamiento.

## 🤖 Tecnologías de IA

- **FastAPI** - Framework web de alto rendimiento
- **OpenCV** - Procesamiento de imágenes y video
- **YOLO (Ultralytics)** - Detección de objetos en tiempo real
- **EasyOCR** - Reconocimiento óptico de caracteres para patentes
- **PyTorch** - Framework de deep learning
- **NumPy & Pillow** - Manipulación de imágenes
- **Redis** - Cache para optimización de rendimiento

## 📁 Estructura del Proyecto

```
python-models/
├── app/
│   ├── main.py                 # Aplicación principal FastAPI
│   ├── api/
│   │   ├── __init__.py
│   │   ├── detection.py        # Endpoints de detección
│   │   ├── license_plate.py    # Endpoints de reconocimiento
│   │   └── health.py          # Health checks
│   ├── models/
│   │   ├── __init__.py
│   │   ├── vehicle_detector.py # Detector de vehículos YOLO
│   │   ├── plate_recognizer.py # Reconocedor de patentes OCR
│   │   └── space_analyzer.py   # Analizador de ocupación
│   ├── core/
│   │   ├── __init__.py
│   │   ├── config.py          # Configuraciones
│   │   └── security.py        # Autenticación
│   └── services/
│       ├── __init__.py
│       ├── image_processor.py  # Procesamiento de imágenes
│       ├── video_stream.py    # Manejo de streams RTSP
│       └── cache.py          # Gestión de cache Redis
├── tests/                     # Pruebas unitarias
├── models/
│   └── weights/              # Modelos pre-entrenados
├── requirements.txt
├── Dockerfile
└── README.md
```

## 🎯 Capacidades de IA

### 🚗 Detección de Vehículos
- **YOLO v8**: Detección en tiempo real de autos, motos, camiones
- **Clasificación por tipo**: Automóviles, motocicletas, vehículos pesados
- **Tracking**: Seguimiento de vehículos en movimiento
- **Confianza**: Score de confianza para cada detección

### 🔤 Reconocimiento de Patentes
- **EasyOCR**: Extracción de texto de patentes chilenas
- **Validación**: Verificación de formato de patentes
- **Múltiples ángulos**: Reconocimiento desde diferentes perspectivas
- **Filtrado**: Limpieza y normalización de texto extraído

### 📊 Análisis de Ocupación
- **Detección de espacios**: Identificación de espacios libres/ocupados
- **Análisis temporal**: Histórico de ocupación por períodos
- **Alertas**: Notificaciones de cambios de estado
- **Estadísticas**: Métricas de uso y patrones

### 📹 Procesamiento de Video
- **Streams RTSP**: Conexión directa con cámaras IP
- **Frames en tiempo real**: Procesamiento continuo de video
- **Batch processing**: Análisis de lotes de imágenes
- **Optimización**: Cache y reutilización de resultados

## 🛠️ Configuración y Ejecución

### Desarrollo Local

1. **Instalar dependencias:**
```bash
pip install -r requirements.txt
```

2. **Configurar variables de entorno:**
```bash
cp .env.example .env
# Editar .env con configuraciones
```

3. **Iniciar servidor de desarrollo:**
```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### Con Docker

1. **Construir imagen:**
```bash
docker build -t smart-parking-ai .
```

2. **Ejecutar contenedor:**
```bash
docker run -d \
  --name smart-parking-ai \
  -p 8000:8000 \
  --env-file .env \
  -v $(pwd)/models:/app/models \
  smart-parking-ai
```

### Con GPU (Recomendado para producción)

```bash
# Construir con soporte GPU
docker build -f Dockerfile.gpu -t smart-parking-ai-gpu .

# Ejecutar con GPU
docker run --gpus all \
  -p 8000:8000 \
  smart-parking-ai-gpu
```

## 🔧 Variables de Entorno

```env
# API Configuration
API_HOST=0.0.0.0
API_PORT=8000
API_WORKERS=4
DEBUG=false

# Model Configuration
YOLO_MODEL_PATH=/app/models/weights/yolov8n.pt
YOLO_CONFIDENCE_THRESHOLD=0.5
YOLO_IOU_THRESHOLD=0.4

# OCR Configuration
OCR_LANGUAGES=es,en
OCR_READER_GPU=true
OCR_CONFIDENCE_THRESHOLD=0.7

# Redis Cache
REDIS_URL=redis://localhost:6379
REDIS_EXPIRE_TIME=3600

# External APIs
BACKEND_API_URL=http://localhost:3001/api
API_KEY=your-api-key

# Logging
LOG_LEVEL=INFO
LOG_FORMAT=json
```

## 📡 Endpoints de la API

### 🚗 Detección de Vehículos
```bash
POST /api/v1/detect/vehicles
Content-Type: multipart/form-data

# Parámetros:
# - image: archivo de imagen
# - confidence: umbral de confianza (opcional)
```

### 🔤 Reconocimiento de Patentes
```bash
POST /api/v1/detect/license-plate
Content-Type: multipart/form-data

# Parámetros:
# - image: archivo de imagen
# - region: región de la patente (opcional)
```

### 📊 Análisis de Ocupación
```bash
POST /api/v1/analyze/occupancy
Content-Type: multipart/form-data

# Parámetros:
# - image: imagen de la zona de estacionamiento
# - spaces_config: configuración de espacios
```

### 📹 Stream de Video en Tiempo Real
```bash
GET /api/v1/stream/camera/{camera_id}
# Retorna stream WebSocket con detecciones

POST /api/v1/stream/process
# Procesa frame individual desde stream RTSP
```

### 🏥 Health Check
```bash
GET /health
# Estado general del servicio

GET /health/models
# Estado de los modelos de IA

GET /health/gpu
# Estado de GPU (si disponible)
```

## 🧪 Ejemplo de Uso

### Detección de Vehículos con Python

```python
import httpx
import asyncio

async def detect_vehicles(image_path):
    async with httpx.AsyncClient() as client:
        with open(image_path, 'rb') as f:
            files = {'image': f}
            response = await client.post(
                'http://localhost:8000/api/v1/detect/vehicles',
                files=files,
                params={'confidence': 0.6}
            )
        return response.json()

# Uso
result = asyncio.run(detect_vehicles('parking_lot.jpg'))
print(f"Vehículos detectados: {len(result['detections'])}")
```

### Reconocimiento de Patente

```python
async def recognize_plate(image_path):
    async with httpx.AsyncClient() as client:
        with open(image_path, 'rb') as f:
            files = {'image': f}
            response = await client.post(
                'http://localhost:8000/api/v1/detect/license-plate',
                files=files
            )
        return response.json()

# Uso
result = asyncio.run(recognize_plate('license_plate.jpg'))
print(f"Patente detectada: {result['plate_text']}")
print(f"Confianza: {result['confidence']}")
```

## 🎛️ Modelos Disponibles

### YOLO v8 para Detección de Vehículos
- **yolov8n.pt**: Modelo nano (rápido, menos preciso)
- **yolov8s.pt**: Modelo small (balanceado)
- **yolov8m.pt**: Modelo medium (más preciso)
- **yolov8l.pt**: Modelo large (producción)

### EasyOCR para Reconocimiento
- **Idiomas**: Español, Inglés
- **Formato**: Patentes chilenas (ABCD12, AB1234)
- **Optimizado**: Para imágenes de cámaras de seguridad

## ⚡ Optimizaciones de Rendimiento

### Cache Redis
- **Resultados**: Cache de detecciones recientes
- **Modelos**: Pre-carga de modelos en memoria
- **Imágenes**: Hash para evitar re-procesamiento

### Procesamiento Asíncrono
- **FastAPI async**: Endpoints no bloqueantes
- **Background tasks**: Procesamiento en cola
- **Connection pooling**: Reutilización de conexiones

### GPU Acceleration
- **CUDA**: Soporte para GPUs NVIDIA
- **Batch processing**: Procesamiento por lotes
- **Mixed precision**: Optimización de memoria

## 🧪 Testing y Validación

```bash
# Ejecutar todas las pruebas
pytest tests/

# Pruebas con cobertura
pytest --cov=app tests/

# Pruebas de rendimiento
pytest tests/performance/

# Validar modelos
python -m pytest tests/models/test_accuracy.py
```

### Métricas de Evaluación
- **mAP**: Mean Average Precision para detección
- **Accuracy**: Precisión de reconocimiento OCR
- **FPS**: Frames por segundo en tiempo real
- **Latencia**: Tiempo de respuesta por imagen

## 📋 Scripts Útiles

```bash
# Descargar modelos pre-entrenados
python scripts/download_models.py

# Validar configuración
python scripts/validate_setup.py

# Benchmark de rendimiento
python scripts/benchmark.py

# Procesar dataset de entrenamiento
python scripts/process_dataset.py
```

## 🔗 Integración con Otros Servicios

### Backend API
- **Webhooks**: Notificación de eventos detectados
- **REST**: Envío de resultados via HTTP
- **WebSocket**: Stream de eventos en tiempo real

### Base de Datos
- **Eventos**: Almacenamiento directo de detecciones
- **Métricas**: Estadísticas de rendimiento
- **Cache**: Optimización de consultas

### Frontend
- **WebSocket**: Stream de detecciones en vivo
- **REST API**: Consultas de análisis
- **Imágenes**: Servicio de imágenes procesadas

## 🛡️ Seguridad

- **API Keys**: Autenticación por tokens
- **Rate Limiting**: Prevención de abuso
- **Input Validation**: Validación de imágenes
- **Sanitización**: Limpieza de datos de entrada

## 🚀 Deployment y Producción

### Docker en Producción
```yaml
# docker-compose.prod.yml
version: '3.8'
services:
  ai-service:
    build: .
    ports:
      - "8000:8000"
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              count: 1
              capabilities: [gpu]
```

### Kubernetes (futuro)
- **HPA**: Auto-scaling basado en carga
- **GPU Nodes**: Nodos especializados con GPU
- **Service Mesh**: Comunicación entre servicios

---

**Nota**: Este servicio requiere recursos computacionales significativos. Para desarrollo, usar modelos pequeños (nano/small). Para producción, considerar GPU y modelos más grandes.
