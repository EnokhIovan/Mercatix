<?php

namespace Database\Seeders;

use App\Models\Merchant;
use App\Models\Product;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
  public function run(): void
  {
    $products = [
      [
        'id' => 1,
        'merchant' => 'Dapur Mama',
        'name' => 'Chicken Katsu',
        'category' => 'Makanan Berat',
        'price' => 18000,
        'image' => 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=600',
      ],
      [
        'id' => 2,
        'merchant' => 'Burger House',
        'name' => 'Burger Special',
        'category' => 'Fast Food',
        'price' => 25000,
        'image' => 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600',
      ],
      [
        'id' => 3,
        'merchant' => 'Dapur Mama',
        'name' => 'Japanese Ramen',
        'category' => 'Makanan Berat',
        'price' => 22000,
        'image' => 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600',
      ],
      [
        'id' => 4,
        'merchant' => 'Sweet Bakery',
        'name' => 'Chocolate Cake',
        'category' => 'Dessert',
        'price' => 15000,
        'image' => 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600',
      ],
      [
        'id' => 5,
        'merchant' => 'Sweet Bakery',
        'name' => 'Strawberry Juice',
        'category' => 'Minuman',
        'price' => 12000,
        'image' => 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=600',
      ],
      [
        'id' => 6,
        'merchant' => 'Burger House',
        'name' => 'French Fries',
        'category' => 'Snack',
        'price' => 10000,
        'image' => 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=600',
      ],
    ];

    foreach ($products as $data) {
      $merchant = Merchant::where('store_name', $data['merchant'])
        ->firstOrFail();

      Product::updateOrCreate(
        ['id' => $data['id']],
        [
          'merchant_id' => $merchant->id,
          'name' => $data['name'],
          'category' => $data['category'],
          'price' => $data['price'],
          'stock' => 20,
          'image' => $data['image'],
          'is_available' => true,
        ]
      );
    }
  }
}
