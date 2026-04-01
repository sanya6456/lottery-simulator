# Stage 1: Base
FROM node:24-alpine AS base

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Stage 2: Development
FROM base AS development

ENV NODE_ENV=development

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host"]

# Stage 3: Build
FROM base AS builder

ENV VITE_API_URL=/api

RUN npm run build

# Stage 4: Production
FROM nginx:alpine AS production

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
