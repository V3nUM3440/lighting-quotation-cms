<?php

namespace Database\Seeders;

use App\Models\Permission;
use App\Models\Role;
use Illuminate\Database\Seeder;

class RolesAndPermissionsSeeder extends Seeder
{
    /**
     * The system permissions.
     *
     * @var list<string>
     */
    public const PERMISSIONS = [
        'activity-logs.view',
        'brands.view',
        'brands.create',
        'brands.update',
        'brands.delete',
        'products.view',
        'products.create',
        'products.update',
        'products.delete',
        'products.import',
        'products.export',
        'projects.view',
        'projects.create',
        'projects.update',
        'revisions.create',
        'revisions.costing-sheet',
        'revisions.quotation',
        'revisions.approve',
        'revisions.validate',
        'revisions.validation-email',
        'revisions.issue',
        'revisions.issue-override',
        'company-settings.update',
        'roles.view',
        'roles.create',
        'roles.update',
        'roles.delete',
        'users.view',
        'users.create',
        'users.update',
        'users.delete',
    ];

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        foreach (self::PERMISSIONS as $name) {
            Permission::query()->firstOrCreate(['name' => $name]);
        }

        Permission::query()->whereNotIn('name', self::PERMISSIONS)->delete();

        Role::query()->firstOrCreate(['name' => Role::ADMIN]);
    }
}
