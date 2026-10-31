<?php

namespace App\Providers;

use App\Models\ActivityLog;
use App\Models\User;
use Carbon\CarbonImmutable;
use Illuminate\Auth\Events\Failed;
use Illuminate\Auth\Events\Login;
use Illuminate\Auth\Events\Logout;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;
use Illuminate\Validation\Rules\Password;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->configureDefaults();

        Gate::before(fn (User $user, string $ability): ?bool => $user->hasPermission($ability) ?: null);

        $this->logAuthentication();
    }

    /**
     * Record sign-ins, sign-outs and failed sign-in attempts in the activity log.
     */
    protected function logAuthentication(): void
    {
        Event::listen(fn (Login $event) => $event->user instanceof User
            ? ActivityLog::record('logged_in', 'Logged in', $event->user, user: $event->user)
            : null);

        Event::listen(fn (Logout $event) => $event->user instanceof User
            ? ActivityLog::record('logged_out', 'Logged out', $event->user, user: $event->user)
            : null);

        Event::listen(fn (Failed $event) => ActivityLog::record(
            'login_failed',
            'Failed login for '.($event->credentials['email'] ?? ''),
            $event->user instanceof User ? $event->user : null,
        ));
    }

    /**
     * Configure default behaviors for production-ready applications.
     */
    protected function configureDefaults(): void
    {
        Date::use(CarbonImmutable::class);

        DB::prohibitDestructiveCommands(
            app()->isProduction(),
        );

        Password::defaults(fn (): ?Password => app()->isProduction()
            ? Password::min(12)
                ->mixedCase()
                ->letters()
                ->numbers()
                ->symbols()
                ->uncompromised()
            : null,
        );
    }
}
