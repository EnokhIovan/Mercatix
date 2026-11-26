<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Wallet;
use Illuminate\Database\Seeder;

class WalletSeeder extends Seeder
{
  public function run(): void
  {
    User::whereIn('role', ['customer', 'merchant'])
      ->each(function ($user) {
        Wallet::firstOrCreate(
          ['user_id' => $user->id],
          ['balance' => 200000]
        );
      });
  }
}