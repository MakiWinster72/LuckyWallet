# ── frontend build ───────────────────────────────────────────────────
FROM node:22-alpine AS frontend-builder

ARG VITE_API_BASE_URL=/api/v1
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}

WORKDIR /app/frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci

COPY frontend/ ./
RUN npm run build

# ── wiki build ───────────────────────────────────────────────────────
FROM node:22-alpine AS wiki-builder

WORKDIR /app/docs
COPY docs/package.json docs/package-lock.json ./
RUN npm ci

COPY docs/ ./
RUN npm run docs:build

# ── nginx stage ─────────────────────────────────────────────────────
FROM nginx:stable-alpine

COPY --from=frontend-builder /app/frontend/dist /usr/share/nginx/html
COPY --from=wiki-builder /app/docs/.vitepress/dist /usr/share/nginx/html/wiki
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
