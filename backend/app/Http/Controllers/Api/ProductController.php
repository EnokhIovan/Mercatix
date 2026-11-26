<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use App\Models\User;
use Illuminate\Http\Request;

class ProductController extends Controller
{
  public function index()
  {
    $products = Product::with('merchant')->get();

    return ProductResource::collection($products);
  }

  public function myProduct(Request $request)
  {
    if ($request->user()->role !== 'merchant') {
      return response()->json([
        'message' => 'User bukan merchant.',
      ], 403);
    }

    $products = Product::with('merchant')
      ->where('merchant_id', $request->user()->id)
      ->get();

    return ProductResource::collection($products);
  }
}