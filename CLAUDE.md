# Lighting Quotation

Laravel 13 + React (TypeScript) via Inertia, built from the official Laravel React starter kit. SQLite database at `database/database.sqlite`.

## What the app is for

A lighting company tracks client enquiries from first contact to final quotation. These are general requirements and will change as each part is built.

- **Directory:** brands and their products, maintained separately and pre-populated with each brand's catalogue.
- **Projects:** each client enquiry becomes a project. The project records the requested products (from the directory) and the other information needed for costing.
- **Costing sheets:** built from the project's products, covering manufacturer costs and profit margins.
- **Quotations:** a costing sheet is converted into the final quotation sent to the client.
- **Revisions:** negotiations can lead to several revisions of a project's products, costing sheet and quotation. Creating a revision should be quick, for example by starting from the previous one.

## Projects and revisions

- A project has general information that can be edited, and one or more revisions. A revision's content is read-only once saved: there are no update or delete routes, `ProjectRevisionItem` throws on update, and `ProjectRevision` only allows its `STATUS_FIELDS` to change. New revisions are added with `Project::addRevision()`.
- Revision statuses (`app/Enums`):
    - **Approval** (`ApprovalStatus`): set when the revision is saved. It's pending if the overall margin (total profit / total price) is below the margin floor company setting, otherwise not required. It's approved or rejected (with a required note) under `revisions.approve`.
    - **Supplier validation** (`SupplierValidation`): starts pending, set to validated or price changed under `revisions.validate`.
    - **Issue**: needs approval to be not required or approved, and validation not price changed. When validated, it's issued under `revisions.issue`; when still pending, it can only be issued as an override with a note under `revisions.issue-override`.
    - Price validation email (`revisions.validation-email`): on the latest unissued revision, "Email brands" opens a `mailto:` draft per brand, addressed to the brand's contact emails. It lists the brand's lines with the price considered (manufacturer price less discount), never our costs, margins or selling prices.
    - `RevisionStage` combines these into one status for lists and filters.
    - Statuses only change on the latest revision (older ones are superseded) and lock once the quotation is issued. Every change is logged with `$revision->record()` in `project_revision_events`.
    - Unissued quotations are marked DRAFT.
- Each revision has its own terms and conditions, stored as HTML and printed in the quotation PDF. They're edited with `components/rich-text-editor.tsx` (Tiptap with a toolbar). The same component, without `onChange`, displays saved terms read-only.
- Revision items keep a snapshot of the product (brand, code, name, description, specs from `Product::specs()`, image) and of the calculated amounts, so later directory changes never change a revision or its documents.
- The costing follows the company's original costing sheet. Each line has quantity, manufacturer price (in the product's currency), discount %, freight %, customs %, exchange rate, accessories (company currency), margin % and an optional target price. `ProjectRevisionItem::fromProduct()` on the backend and `lib/pricing.ts` for the live form preview must match:
    - unit cost = manufacturer price x (1 - discount%) x (1 + freight%) x (1 + customs%) x exchange rate
    - total unit cost = unit cost + accessories
    - unit price = total unit cost / (1 - margin%)
    - total cost = total unit cost x qty; total price = unit price x qty; margin at target = (1 - total unit cost / target) x 100
    - each stored value is rounded to 2 decimals, and VAT is charged on the revision total (not per line).
- Company-level settings (company details, logo, stamp and signature images, currency, VAT rate, exchange rates, and revision defaults: freight/customs for imported products, validity, payment terms, terms and conditions) are edited by admins under Settings → Company (`company-settings.update` permission). They're saved per group in the `settings` table and read with `Setting::get('company.phone')`. `config/quotation.php` only holds the default values. Always read these through `Setting::get()`, never through `config('quotation...')`. Each revision stores its VAT rate, and each line stores the exchange rate it was priced at.
- The quotation number is the project's `reference` plus the revision, e.g. "RA QTS 10-E16086 R1" (`ProjectRevision::quoteNumber()`).

## Spreadsheets and PDFs

- Excel: Laravel Excel 4.x (`maatwebsite/excel`). Export classes live in `app/Exports` and import classes in `app/Imports`. Spreadsheet templates are stored in `storage/templates` and filled using `WithExportTemplate`.
- PDF: `barryvdh/laravel-dompdf` (Blade views rendered to PDF). The quotation (`resources/views/pdf/quotation.blade.php`) recreates the original quotation layout; page numbers are stamped on the canvas after rendering. Never enable DomPDF's PHP option, since terms are user-entered HTML.
- The costing sheet (`resources/views/exports/costing-sheet.blade.php`) recreates the original costing sheet, with live Excel formulas that round like the app.
- Products template: `storage/templates/products.xlsx`. Its header row must match `Product::SPREADSHEET_COLUMNS`. Product images and brand logos are uploaded in the app to the `public` disk (`php artisan storage:link`). Set column formats on whole columns, not cell ranges, because pre-formatted cells make exports append below them.

## Standards and conventions

- Keep all code simple, maintainable, and following Laravel / React standards and the starter kit's existing patterns.
- Do not over-complicate features or optimize prematurely, unless explicitly asked.
- Do not add code comments unless explicitly asked.
- Do not add automated tests unless explicitly asked.
- Do not add bloat: no extra packages, files, abstractions, or features beyond what was asked.
- The app is still in development: change existing migrations directly instead of adding new "alter" migrations.

## Users and authentication

- There is no public registration and no password reset by email. Fortify's `features` list is empty.
- Access control is role-based: each user has one role (`users.role_id`), and each role has many permissions. The permission list is fixed and defined in `database/seeders/RolesAndPermissionsSeeder.php`. For every new action or CRUD operation, add its permission there (`resource.action`, e.g. `users.create`), and run `php artisan db:seed --class=RolesAndPermissionsSeeder`. Other roles are managed in the app (Roles page).
- The `Admin` role (`Role::ADMIN`) is a system role. It can't be edited or deleted, and it always has every permission, including future ones (`User::isAdmin()` / `Gate::before`). No one can grant more than they have: a non-admin can only assign roles, edit or delete users, and edit or delete roles whose permissions are all ones they hold (`User::canManageRole()` / `canManageUser()`, `Role::isEditableBy()`), and can only grant permissions they hold (`RoleRequest`). So only admins can assign the Admin role or manage admin users.
- Activity log (`activity_logs`, `activity-logs.view`): models using the `LogsActivity` trait log their creates, updates and deletes with before/after values (hidden fields masked, `activityLabel()` names the record). Logins, logouts and failed logins are logged in `AppServiceProvider`. Actions that don't fire model events (downloads, imports, bulk queries, pivot syncs) are logged with `ActivityLog::record()`. Add the trait to new models and log new actions like these. Log entries can't be edited or deleted.
- Check permissions with Laravel's Gate (`->can('users.view')` on routes, `$user->can(...)`, `@can`). On the frontend, use `auth.permissions` from the shared Inertia props.
- `php artisan db:seed` creates the permissions, the Admin role and the admin user (`admin@example.com`, Admin role).
- The seeded admin and every new user get `DEFAULT_USER_PASSWORD` from `.env` (via `config('auth.default_password')`). Users change it under Settings → Security.
- Forgotten passwords: the login page tells the user to contact the systems team, who reset it in the database.

## Lists

Every list must follow this standard:

- Paginated on the backend: `->paginate(25)->withQueryString()` (larger pages, e.g. 50, only where it makes sense), never `->get()` for a list.
- Filterable with relevant filters: read them with `$request->only([...])`, apply them with `->when(...)`, and return them to the page as `filters` so the inputs keep their values.
- Frontend: put the filter fields in `components/filters.tsx` (a GET form with Filter and Reset), use `components/pagination.tsx` under the table (summary plus Previous/Next), and give the table an empty state through `Table.Body renderEmptyState`. Use `components/select-field.tsx` for dropdown filters.
- Dropdown filters are multi-select (`isMultiple`) wherever choosing several values makes sense, and they match any of the selected values. Use a plural filter key (`roles`, `tags`, `brands`) and handle it on the backend with `whereIn(..., (array) $values)` or an equivalent "any of" query.

## Styling

- Brand: Rura Lighting (https://www.ruralighting.com). Primary/accent amber `#FCB040` (HeroUI `--accent`, so use `bg-accent`/`text-accent-foreground`), dark text `#232323`. Fonts: Inter (`font-sans`, body) and Plus Jakarta Sans (`font-heading`, headings and the logo name). The company logo (`public/images/logo.png`) is used on printed documents; the app uses the light-bulb mark in `components/app-logo.tsx`.

- UI components come from HeroUI v3 (`@heroui/react`, docs: https://heroui.com/en/docs/react/components). Use a HeroUI component whenever one exists before building anything custom.
- Customize with Tailwind utility classes. Avoid custom CSS/SCSS; only add CSS to `resources/css/app.css` when it is clearly the more efficient option, such as global theme variable overrides.
- Use HeroUI theme colors (`bg-background`, `text-foreground`, `text-muted`, `bg-accent`, `border-separator`, `text-danger`...) rather than hard-coded palette colors, so dark mode keeps working.
- Navigation links use Inertia's `<Link>`. To make one look like a button, use `className={buttonVariants(...)}`. HeroUI components that take an `href` (Link, Breadcrumbs, Dropdown items) route through Inertia via the `RouterProvider` in `app.tsx`.
- Fields are outlined so it's clear where to type: `--field-border`, `--field-border-width` and `--field-border-focus` (amber on focus) are set in `app.css`, which covers every HeroUI field. Custom inputs that aren't HeroUI fields use `border border-field-border bg-field` to match.
- Form inputs use `components/form-field.tsx` and `components/password-field.tsx`, which show Inertia server validation errors.
- Icons come from `lucide-react`.
- Charts use Recharts, in the `--chart` amber (`bg-chart`, `var(--chart)`, with a darker value for light mode so it stays readable). Gridlines use `var(--separator)` and axis text `var(--muted)`. The dashboard (`DashboardController`) bases its statistics on each project's latest revision and is only shown to users with `projects.view`.

## Development

The dev environment runs in Docker. The whole project directory (including `.env` and the SQLite file) is bind-mounted, so code changes reload live. `vendor` and `node_modules` live in Docker volumes for speed and so Linux binaries don't clash with the host.

- Start: `docker compose up` (app at http://localhost:8000, Vite at 5173)
- Run commands in the container: `docker compose exec app php artisan ...`, `docker compose exec app npm ...`, `docker compose exec app composer ...`
- After changing dependencies, run `composer install` / `npm install` inside the container.
- On startup the container installs Composer/npm dependencies if missing, creates `.env` and the SQLite file if missing, generates the app key, and runs migrations.
- Checks: `composer test` (Pint, PHPStan, PHPUnit), `npm run check`, `npm run types:check`
