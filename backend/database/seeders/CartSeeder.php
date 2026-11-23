<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Cart;

class CartSeeder extends Seeder
{
  public function run(): void
  {
    Cart::updateOrCreate(
      ['user_id' => 2,
      'product_id' => 1],
      ['quantity' => 3]
    );

    Cart::updateOrCreate(
      ['user_id' => 1,
      'product_id' => 2],
      ['quantity' => 3]
    );

    Cart::updateOrCreate(
      ['user_id' => 2,
      'product_id' => 3],
      ['quantity' => 5]
    );
  }
}
