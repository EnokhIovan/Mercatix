<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Middleware\AuthenticateToken;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\WalletController;
use App\Http\Controllers\Api\CartController;

Route::post('/login', [AuthController::class, 'login']);

Route::middleware(AuthenticateToken::class)->group(function () {
  Route::post('/logout', [AuthController::class, 'logout']);
  Route::get('/user', [AuthController::class, 'user']);
  Route::get('/products', [ProductController::class, 'index']);
  Route::get('/wallet', [WalletController::class, 'index']);
  Route::get('/cart', [CartController::class, 'index']);
  Route::post('/cart/action', [CartController::class, 'action']);
  Route::post('/cart/quantity', [CartController::class, 'quantity']);
  Route::post('/wallet/topup', [WalletController::class, 'topup']);
  Route::post('/wallet/transfer', [WalletController::class, 'transfer']);

  Route::post('/wallet/checkout', [WalletController::class, 'checkout']);
  // Route::middleware('auth:sanctum')->group(function () {
  // });
});
