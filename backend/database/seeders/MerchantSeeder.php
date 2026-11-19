<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Merchant;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class MerchantSeeder extends Seeder
{
  public function run(): void
  {
    $merchants = [
      [
        'name' => 'Plato',
        'email' => 'plato@mercatix.merchant.id',
        'store_name' => 'Dapur Mama',
      ],
      [
        'name' => 'Pythagoras',
        'email' => 'pythagoras@mercatix.merchant.id',
        'store_name' => 'Burger House',
      ],
      [
        'name' => 'Herakleitos',
        'email' => 'herakleitos@mercatix.merchant.id',
        'store_name' => 'Sweet Bakery',
      ],
    ];

    foreach ($merchants as $data) {
      $user = User::updateOrCreate(
        ['email' => $data['email']],
        [
          'name' => $data['name'],
          'role' => 'merchant',
          'password' => Hash::make('password'),
        ]
      );

      Merchant::updateOrCreate(
        ['user_id' => $user->id],
        [
          'store_name' => $data['store_name'],
        ]
      );
    }
  }
}
