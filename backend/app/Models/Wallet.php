<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

use App\Models\User;

class Wallet extends Model
{
  protected $fillable = [
    'user_id',
    'balance',
  ];

  protected function casts(): array
  {
    return [
      'balance' => 'decimal:2',
    ];
  }

  public function user(): BelongsTo
  {
    return $this->belongsTo(User::class);
  }

  public function transactions(): HasMany
  {
    return $this->hasMany(WalletTransaction::class);
  }

  public function addBalance($amount, $description = null)
  {
    if ($amount <= 0) {
      throw ValidationException::withMessages([
        'amount' => 'Nominal harus lebih dari 0.',
      ]);
    }

    return DB::transaction(function () use ($amount, $description) {
      $wallet = self::whereKey($this->id)
        ->lockForUpdate()
        ->firstOrFail();

      $wallet->increment('balance', $amount);

      return $wallet->transactions()->create([
        'type' => 'top_up',
        'amount' => $amount,
        'description' => $description,
      ]);
    });
  }

  public function deductBalance($amount, $description = null, $type = 'payment')
  {
    if ($amount <= 0) {
      throw ValidationException::withMessages([
        'amount' => 'Nominal harus lebih dari 0.',
      ]);
    }

    return DB::transaction(function () use ($amount, $description, $type) {
      $wallet = self::whereKey($this->id)
        ->lockForUpdate()
        ->firstOrFail();

      if ($wallet->balance < $amount) {
        throw ValidationException::withMessages([
          'balance' => 'Saldo tidak mencukupi.',
        ]);
      }

      $wallet->decrement('balance', $amount);

      return $wallet->transactions()->create([
        'type' => $type,
        'amount' => $amount,
        'description' => $description,
      ]);
    });
  }
}
