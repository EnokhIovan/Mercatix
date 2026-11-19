<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductResource extends JsonResource
{
  public function toArray(Request $request): array
  {
    return [
      'id' => $this->id,
      'name' => $this->name,
      'description' => $this->description,
      'category' => $this->category,
      'price' => $this->price,
      'stock' => $this->stock,
      'image' => $this->image,
      'is_available' => $this->is_available,

      'merchant' => [
        'id' => $this->merchant->id,
        'store_name' => $this->merchant->store_name,
      ],
    ];
  }
}
