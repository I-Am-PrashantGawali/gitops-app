FROM node:18-alpine

WORKDIR /app

# Install dependencies first (cached layer)
COPY package*.json ./
RUN npm ci --registry https://registry.npmjs.org/

# Copy application source
COPY . .

EXPOSE 8080

CMD ["node", "index.js"]
