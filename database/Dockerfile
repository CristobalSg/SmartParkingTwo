# Imagen oficial de PostgreSQL
FROM postgres:15-alpine

# Variables de entorno por defecto
ENV POSTGRES_DB=smart_parking
ENV POSTGRES_USER=postgres
ENV POSTGRES_PASSWORD=parking123

# Crear directorio para scripts de inicialización
RUN mkdir -p /docker-entrypoint-initdb.d

# Copiar scripts de inicialización
COPY init/*.sql /docker-entrypoint-initdb.d/

# Copiar scripts de seeds (datos de prueba)
COPY seeds/*.sql /docker-entrypoint-initdb.d/

# Exponer puerto 5432
EXPOSE 5432

# Configurar timezone
RUN apk add --no-cache tzdata
ENV TZ=America/Santiago

# Configuraciones adicionales de PostgreSQL
COPY postgresql.conf /etc/postgresql/postgresql.conf

# El comando por defecto ya está definido en la imagen base
