FROM node:20-slim

ENV DEBIAN_FRONTEND=noninteractive

# Python + LibreOffice
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    python3-pip \
    libreoffice \
    poppler-utils \
    && apt-get clean \apt/lists/*

# Instala pdf2docx 
RUN pip3 install --no-cache-dir --break-system-packages pdf2docx

WORKDIR /app

# Dependências Node
COPY package*.json ./
RUN npm install --omit=dev   # ou npm install --only=production

# Código (Node + Python)
COPY . .

RUN mkdir -p /app/uploads /app/converted

EXPOSE 3000

CMD ["node", "index.js"]