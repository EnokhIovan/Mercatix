<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Cart;
use App\Http\Resources\CartResource;
use Illuminate\Http\Request;

class CartController extends Controller
{
  public function index(Request $request)
  {
    $cartItems = Cart::with('product')
    ->where('user_id', $request->user()->id)
    ->get();

    return CartResource::collection($cartItems);
  }
}
