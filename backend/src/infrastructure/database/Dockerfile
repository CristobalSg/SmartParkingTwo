FROM postgres:15-alpine

# Instalar Node.js para ejecutar scripts de seed
RUN apk add --no-cache nodejs npm

# Variables de entorno por defecto
ENV POSTGRES_DB=smart_parking_dev
ENV POSTGRES_USER=postgres
ENV POSTGRES_PASSWORD=1234

# Crear directorio para scripts
RUN mkdir -p /docker-entrypoint-initdb.d

# Copiar scripts de inicialización si existen
COPY scripts/ /docker-entrypoint-initdb.d/
COPY prisma/ /app/prisma/

# Establecer permisos ejecutables para scripts
RUN chmod +x /docker-entrypoint-initdb.d/*.sh

# Exponer puerto
EXPOSE 5432

# Comando por defecto
CMD ["postgres"]
