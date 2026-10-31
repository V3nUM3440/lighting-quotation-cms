#!/bin/sh
set -e

[ -f .env ] || cp .env.example .env
[ -f database/database.sqlite ] || touch database/database.sqlite

[ -f vendor/autoload.php ] || composer install --no-interaction
[ -f node_modules/.package-lock.json ] || npm install

grep -q '^APP_KEY=.\+' .env || php artisan key:generate
php artisan migrate --force
[ -e public/storage ] || php artisan storage:link

exec "$@"
