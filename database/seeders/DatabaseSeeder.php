<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call(RolesAndPermissionsSeeder::class);

        User::query()->firstOrCreate(
            ['email' => config('auth.default_email')],
            [
                'name' => 'Admin',
                'password' => config('auth.default_password'),
                'role_id' => Role::query()->where('name', 'Admin')->value('id'),
            ],
        );
    }
}
