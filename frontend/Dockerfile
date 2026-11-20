FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install --registry https://registry.npmjs.org/

COPY . .
RUN npm run build

# ── Production stage ─────────────────────────────────────────────────────────
FROM nginx:1.25-alpine

COPY --from=builder /app/build /usr/share/nginx/html

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
