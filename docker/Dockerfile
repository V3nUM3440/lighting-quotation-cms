FROM php:8.4-cli

ARG UID=1000
ARG GID=1000

COPY --from=mlocati/php-extension-installer:2 /usr/bin/install-php-extensions /usr/local/bin/
COPY --from=composer:2 /usr/bin/composer /usr/local/bin/composer
COPY --from=node:22-bookworm-slim /usr/local/bin/node /usr/local/bin/node
COPY --from=node:22-bookworm-slim /usr/local/lib/node_modules /usr/local/lib/node_modules

RUN ln -s /usr/local/lib/node_modules/npm/bin/npm-cli.js /usr/local/bin/npm \
    && ln -s /usr/local/lib/node_modules/npm/bin/npx-cli.js /usr/local/bin/npx \
    && apt-get update \
    && apt-get install -y --no-install-recommends git unzip sqlite3 \
    && rm -rf /var/lib/apt/lists/* \
    && install-php-extensions pcntl zip intl opcache gd

RUN groupadd --gid ${GID} app \
    && useradd --uid ${UID} --gid ${GID} --create-home app \
    && mkdir -p /var/www/html/node_modules /var/www/html/vendor \
    && chown -R app:app /var/www/html

COPY php.ini /usr/local/etc/php/conf.d/app.ini
COPY entrypoint.sh /usr/local/bin/entrypoint

WORKDIR /var/www/html

USER app

EXPOSE 8000 5173

ENTRYPOINT ["sh", "/usr/local/bin/entrypoint"]
CMD ["php", "artisan", "dev", "--inline"]
