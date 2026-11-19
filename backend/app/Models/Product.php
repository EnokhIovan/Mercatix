<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Product extends Model
{
  protected $fillable = [
    'merchant_id',
    'name',
    'category',
    'description',
    'price',
    'stock',
    'image',
    'is_available',
  ];

  protected function casts(): array
  {
    return [
      'price' => 'decimal:2',
      'stock' => 'integer',
      'is_available' => 'boolean',
    ];
  }

  public function merchant(): BelongsTo
  {
    return $this->belongsTo(Merchant::class);
  }
}
