<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Wallet;
use Illuminate\Database\Seeder;

class WalletSeeder extends Seeder
{
  public function run(): void
  {
    User::all()->each(function ($user) {
      $wallet = Wallet::firstOrCreate([
        'user_id' => $user->id,
      ]);

      if ($wallet->wasRecentlyCreated) {
        $wallet->addBalance(100000, 'Saldo awal dummy');
      }
    });
  }
}
