# Usar Node.js 18 LTS como imagen base
FROM node:18-alpine

# Crear directorio de la aplicación
WORKDIR /app

# Copiar archivos de configuración de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar código fuente
COPY . .

# Construir la aplicación TypeScript
RUN npm run build

# Crear usuario no root
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Cambiar permisos
USER nodejs

# Exponer puerto 3001
EXPOSE 3001

# Comando de inicio
CMD ["npm", "start"]
