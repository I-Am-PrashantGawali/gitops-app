FROM node:18-alpine AS builder

WORKDIR /app

# Install dependencies first (cached layer)
COPY package*.json ./
RUN npm ci --registry https://registry.npmjs.org/

# Copy source and build
COPY . .
RUN npm run build

# ── Production stage — serve with nginx ──────────────────────────────────────
FROM nginx:1.25-alpine

# Copy the React build output
COPY --from=builder /app/build /usr/share/nginx/html

# Custom nginx config — handle React client-side routing
RUN printf 'server {\n\
    listen 3000;\n\
    root /usr/share/nginx/html;\n\
    index index.html;\n\
    location / {\n\
        try_files $uri $uri/ /index.html;\n\
    }\n\
    location /health {\n\
        return 200 "ok";\n\
        add_header Content-Type text/plain;\n\
    }\n\
}\n' > /etc/nginx/conf.d/default.conf

EXPOSE 3000
CMD ["nginx", "-g", "daemon off;"]
