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

  public function action(Request $request)
  {
    $data = $request->validate([
      'product_id' => 'required|exists:products,id',
      'action' => 'required|in:create,delete',
    ]);

    $userId = $request->user()->id;

    switch ($data['action']) {
      case 'create':
        $cart = Cart::firstOrCreate([
          'user_id' => $userId,
          'product_id' => $data['product_id'],
        ], [
          'quantity' => 1,
        ]);

        return response()->json([
          'message' => $cart->wasRecentlyCreated
            ? 'Produk berhasil ditambahkan!'
            : 'Produk sudah ada di cart!',
          'created' => $cart->wasRecentlyCreated,
        ]);

      case 'delete':
        Cart::where('user_id', $userId)
          ->where('product_id', $data['product_id'])
          ->delete();

        return response()->json([
          'message' => 'Produk berhasil dihapus!'
        ]);
    }
  }

  public function quantity(Request $request){
    $data = $request->validate([
      'product_id' => 'required|exists:products,id',
      'quantity' => 'required|integer|min:1',
    ]);
    $userId = $request->user()->id;

    Cart::updateOrCreate(
      ['user_id' => $userId,
      'product_id' => $data['product_id']],
      ['quantity' => $data['quantity']]
    );

    return response()->json(['message' => 'Kuantitas produk berhasil diperbaharui!']);
  }
}
