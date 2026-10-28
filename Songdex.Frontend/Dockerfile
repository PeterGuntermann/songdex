# Stage 1: Build the Angular application
FROM node:24-alpine AS build

WORKDIR /usr/src/app

# pnpm ships with Node via corepack. Pinned here rather than through a packageManager field
# in package.json, because pnpm then writes itself into pnpm-lock.yaml with one entry per
# platform binary.
RUN corepack enable && corepack prepare pnpm@12.13.0 --activate

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm run build

# Stage 2: Serve the application with Nginx
FROM nginx:1.29-alpine
COPY nginx.conf /etc/nginx/conf.d/coversongs.conf
COPY --from=build /usr/src/app/dist/coversongs-frontend/browser /usr/share/nginx/html
