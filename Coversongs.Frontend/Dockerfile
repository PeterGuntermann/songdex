# Stage 1: Build the Angular application
FROM node:20-alpine AS build

WORKDIR /usr/src/app

COPY package.json package-lock.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Serve the application with Nginx
FROM nginx:1.17.1-alpine
COPY nginx.conf /etc/nginx/nginx.conf
COPY --from=build /usr/src/app/dist/coversongs-frontend /usr/share/nginx/html
