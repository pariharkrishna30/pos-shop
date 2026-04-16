# Stage 1: Build Laravel backend
FROM php:8.2-fpm AS backend

LABEL org.opencontainers.image.title="POS System" \
      org.opencontainers.image.description="Point of Sale system with Laravel backend and React frontend, containerized using Docker" \
      org.opencontainers.image.version="1.0.0" \
      org.opencontainers.image.authors="Krishna parihar" \
      org.opencontainers.image.source="https://github.com/pariharkrishna30/pos-shop"

# Install system dependencies
RUN apt-get update && apt-get install -y \
    git unzip libpng-dev libonig-dev libxml2-dev zip curl npm nodejs \
    && docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Install Composer
COPY --from=composer:2.5 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www

# Copy PHP dependencies first for caching
COPY backend/composer.json backend/composer.lock ./

# Install Laravel dependencies
RUN composer install --no-dev --optimize-autoloader --no-scripts

# Copy Laravel app code
COPY backend/ ./

# Create env file (required)
RUN cp .env.example .env || true

# Generate app key (required before caching)
RUN php artisan key:generate || true

# Now safe to cache
RUN php artisan config:cache || true \
    && php artisan route:cache || true \
    && php artisan view:cache || true

# Set proper permissions
RUN chown -R www-data:www-data /var/www

# Stage 2: Build React frontend
FROM node:20 AS frontend

WORKDIR /app

COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# Stage 3: Final image
FROM php:8.2-fpm

WORKDIR /var/www

# Copy Laravel backend
COPY --from=backend /var/www /var/www

# Copy React build into Laravel public folder
COPY --from=frontend /app/dist /var/www/public

# Set permissions
RUN chown -R www-data:www-data /var/www

EXPOSE 9000

CMD ["php-fpm"]