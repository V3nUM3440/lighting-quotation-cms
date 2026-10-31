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
        Schema::create('brands', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->json('tags')->nullable();
            $table->string('website')->nullable();
            $table->string('logo_path')->nullable();
            $table->boolean('is_partner')->default(false);
            $table->timestamps();
        });

        Schema::create('brand_contacts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('brand_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('phone')->nullable();
            $table->string('email')->nullable();
            $table->timestamps();
        });

        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->foreignId('brand_id')->constrained()->cascadeOnDelete();
            $table->string('code');
            $table->string('name');
            $table->text('description')->nullable();
            $table->string('uom')->default('NOS.');
            $table->string('currency', 3);
            $table->decimal('manufacturer_price', 12, 2);
            $table->string('image_path')->nullable();
            $table->string('wattage')->nullable();
            $table->string('lumens')->nullable();
            $table->string('color_temperature')->nullable();
            $table->string('cri')->nullable();
            $table->string('beam_angle')->nullable();
            $table->string('ip_rating')->nullable();
            $table->string('finish')->nullable();
            $table->timestamps();

            $table->unique(['brand_id', 'code']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('products');
        Schema::dropIfExists('brand_contacts');
        Schema::dropIfExists('brands');
    }
};
