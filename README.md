# Lighting Quotation

Rura Lighting's internal app for tracking client enquiries from first contact to final quotation: a brand and product directory, projects with revisions, costing sheets (Excel) and quotations (PDF).

Built with Laravel 13, React (TypeScript) and Inertia, HeroUI and Tailwind, on a SQLite database.

## Running with Docker (recommended)

Requirements: [Docker](https://www.docker.com/) with Docker Compose.

```bash
git clone <repository-url> lighting-quotation
cd lighting-quotation
docker compose up --build
```

On first start the container installs the Composer and npm dependencies, creates `.env` and the SQLite database, generates the app key and runs the migrations. This can take a few minutes.

Once it's running, create the permissions and the admin user (first time only):

```bash
docker compose exec app php artisan db:seed
```

Open http://localhost:8000 and log in as `admin@example.com` with the `DEFAULT_USER_PASSWORD` from `.env` (`password` by default).

The project folder is mounted into the container, so code changes reload live. Run any command inside the container with `docker compose exec app ...`:

```bash
docker compose exec app php artisan migrate
docker compose exec app composer install
docker compose exec app npm install
```

`vendor` and `node_modules` live in Docker volumes, so after changing dependencies run `composer install` / `npm install` inside the container, not on your machine.

## Running without Docker

Requirements:

- PHP 8.4 with the `pdo_sqlite`, `intl`, `zip`, `gd` and `mbstring` extensions
- [Composer](https://getcomposer.org/)
- Node.js 22 and npm

```bash
git clone <repository-url> lighting-quotation
cd lighting-quotation

composer install
npm install

cp .env.example .env
php artisan key:generate

touch database/database.sqlite
php artisan migrate --seed
php artisan storage:link

php artisan dev
```

Open http://localhost:8000 and log in as described above. `php artisan dev` runs the Laravel server and Vite together. If it doesn't work on your system, run `php artisan serve` and `npm run dev` in two terminals instead.

## Checks

Run these before pushing (prefix with `docker compose exec app` when using Docker):

```bash
composer test          # Pint, PHPStan and PHPUnit
npm run check          # formatting and lint
npm run types:check    # TypeScript
```

`composer lint` and `npm run check:fix` fix formatting automatically.

## Notes

- There is no public registration. Admins add users under Users. New users get `DEFAULT_USER_PASSWORD` and change it under Settings → Security.
- Permissions are defined in `database/seeders/RolesAndPermissionsSeeder.php`. After adding one, run `php artisan db:seed --class=RolesAndPermissionsSeeder`.
- Company details, images, VAT, exchange rates and quotation defaults are edited by admins under Settings → Company.
- Project conventions and architecture notes are in [CLAUDE.md](CLAUDE.md). Please read them before contributing.
