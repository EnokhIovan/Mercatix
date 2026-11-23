<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CartResource extends JsonResource
{
  public function toArray(Request $request): array
  {
    return [
      // 'id' => $this->id,
      'quantity' => $this->quantity,
      'id' => $this->product->id,
      'name' => $this->product->name,
      'price' => $this->product->price,
      'image' => $this->product->image,
    ];
  }
}