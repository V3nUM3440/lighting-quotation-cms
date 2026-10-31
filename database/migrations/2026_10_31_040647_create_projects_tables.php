<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('projects', function (Blueprint $table) {
            $table->id();
            $table->string('reference')->unique();
            $table->string('name');
            $table->date('inquiry_received_at');
            $table->foreignId('salesperson_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('client_name');
            $table->string('client_address')->nullable();
            $table->string('client_phone')->nullable();
            $table->string('client_mobile')->nullable();
            $table->string('client_email')->nullable();
            $table->string('attention')->nullable();
            $table->string('client_reference')->nullable();
            $table->timestamps();
        });

        Schema::create('project_revisions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->constrained()->cascadeOnDelete();
            $table->unsignedInteger('number');
            $table->foreignId('prepared_by_id')->nullable()->constrained('users')->nullOnDelete();
            $table->decimal('vat_rate', 5, 2);
            $table->unsignedInteger('validity_days');
            $table->text('payment_terms')->nullable();
            $table->text('terms')->nullable();
            $table->decimal('margin_floor', 5, 2);
            $table->string('approval_status');
            $table->text('approval_note')->nullable();
            $table->foreignId('approved_by_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('approved_at')->nullable();
            $table->string('supplier_validation');
            $table->timestamp('issued_at')->nullable();
            $table->foreignId('issued_by_id')->nullable()->constrained('users')->nullOnDelete();
            $table->text('issue_note')->nullable();
            $table->timestamps();

            $table->unique(['project_id', 'number']);
        });

        Schema::create('project_revision_events', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_revision_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('action');
            $table->text('note')->nullable();
            $table->timestamps();
        });

        Schema::create('project_revision_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_revision_id')->constrained()->cascadeOnDelete();
            $table->foreignId('product_id')->nullable()->constrained()->nullOnDelete();
            $table->string('type')->nullable();
            $table->string('brand_name');
            $table->string('product_code');
            $table->string('product_name');
            $table->text('description')->nullable();
            $table->json('specs')->nullable();
            $table->string('image_path')->nullable();
            $table->string('uom');
            $table->string('currency', 3);
            $table->decimal('quantity', 12, 2);
            $table->decimal('manufacturer_price', 12, 2);
            $table->decimal('discount', 5, 2);
            $table->decimal('freight', 5, 2);
            $table->decimal('customs', 5, 2);
            $table->decimal('exchange_rate', 10, 4);
            $table->decimal('unit_cost', 12, 2);
            $table->decimal('accessories', 12, 2);
            $table->decimal('total_unit_cost', 12, 2);
            $table->decimal('margin', 7, 4);
            $table->decimal('unit_price', 12, 2);
            $table->decimal('total_cost', 14, 2);
            $table->decimal('total_price', 14, 2);
            $table->decimal('target_price', 12, 2)->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('project_revision_items');
        Schema::dropIfExists('project_revision_events');
        Schema::dropIfExists('project_revisions');
        Schema::dropIfExists('projects');
    }
};
