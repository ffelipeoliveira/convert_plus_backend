FROM node:20-slim

ENV DEBIAN_FRONTEND=noninteractive

# Instalar LibreOffice
RUN apt-get update && apt-get install -y --no-install-recommends \
    libreoffice \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Instalar dependências Node
COPY package*.json ./
RUN npm install --omit=dev

# Copiar código
COPY . .

# Criar pastas
RUN mkdir -p /app/uploads /app/converted

EXPOSE 3000

CMD ["node", "src/server.js"]