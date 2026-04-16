<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Product;
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
        User::factory()->create([
            'name' => 'Admin User',
            'email' => 'admin@pos.local',
            'password' => 'password',
            'role' => 'admin',
        ]);

        Category::create([
            'name' => 'Beverages',
            'description' => 'Cold and hot drinks',
        ]);

        Category::create([
            'name' => 'Food',
            'description' => 'Snacks and meals',
        ]);

        Product::create([
            'name' => 'Sparkling Water',
            'barcode' => '0001110001110',
            'price' => 2.75,
            'stock_quantity' => 120,
            'category_id' => 1,
        ]);

        Product::create([
            'name' => 'Sandwich',
            'barcode' => '0002220002220',
            'price' => 6.50,
            'stock_quantity' => 50,
            'category_id' => 2,
        ]);
    }
}
