<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Models\Wallet;

class userSeeder extends Seeder
{
  public function run(): void
  {
    User::updateOrCreate(
      ['email' => 'admin@mercatix.id'],
      [
        'name' => 'Sokratez',
        'role' => 'admin',
        'password' => Hash::make('password')
      ]
    );

    $customer = User::updateOrCreate(
      ['email' => 'aristoteles@mercatix.id'],
      [
        'name' => 'Aristoteles',
        'role' => 'customer',
        'password' => Hash::make('password')
      ]
    );
  }
}
