<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

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

    User::updateOrCreate(
      ['email' => 'aristoteles@mercatix.id'],
      [
        'name' => 'Aristoteles',
        'role' => 'customer',
        'password' => Hash::make('password')
      ]
    );

    User::updateOrCreate(
      ['email' => 'plato@mercatix.merchant.id'],
      [
        'name' => 'Plato',
        'role' => 'merchant',
        'password' => Hash::make('password')
      ]
    );

    User::updateOrCreate(
      ['email' => 'pythagoras@mercatix.merchant.id'],
      [
        'name' => 'Pythagoras',
        'role' => 'merchant',
        'password' => Hash::make('password')
      ]
    );

    User::updateOrCreate(
      ['email' => 'herakleitos@mercatix.merchant.id'],
      [
        'name' => 'Herakleitos',
        'role' => 'merchant',
        'password' => Hash::make('password')
      ]
    );
  }
}
