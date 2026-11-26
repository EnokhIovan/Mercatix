<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Validation\Rule;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\Wallet;
use App\Models\Merchant;
use App\Models\Cart;
use Illuminate\Validation\ValidationException;

class WalletController extends Controller
{
  public function index(Request $request)
  {
    $wallet = Wallet::where('user_id', $request->user()->id)->first();

    return response()->json($wallet);
  }

  public function topUp(Request $request)
  {
    $validated = $request->validate([
      'amount' => 'required|numeric|min:10000',
    ]);

    $wallet = $request->user()->wallet;

    $wallet->addBalance(
      $validated['amount'],
      'Top up saldo'
    );

    return response()->json([
      'message' => 'Top up berhasil.',
      'balance' => $wallet->fresh()->balance,
    ]);
  }

  public function transfer(Request $request)
  {
    $validated = $request->validate([
      'amount' => 'required|numeric|min:1',
      'merchant_id' => [
        'required',
        'integer',
        Rule::exists('merchants', 'id'),
      ],
      'product_id' => 'required|integer|exists:products,id',
      'description' => 'nullable|string',
    ]);

    $user = $request->user();

    $merchant = Merchant::with('user.wallet')
      ->findOrFail($validated['merchant_id']);

    $product = $merchant->products()
      ->findOrFail($validated['product_id']);

    $senderWallet = $user->wallet;
    $merchantWallet = $merchant->user->wallet;

    if (!$senderWallet) {
      return response()->json([
        'message' => 'Wallet pembeli tidak ditemukan.',
      ], 404);
    }

    if (!$merchantWallet) {
      return response()->json([
        'message' => 'Wallet merchant tidak ditemukan.',
      ], 404);
    }

    if ($senderWallet->id === $merchantWallet->id) {
      throw ValidationException::withMessages([
        'merchant_id' => 'Tidak bisa transfer ke wallet sendiri.',
      ]);
    }

    $amount = $validated['amount'];

    DB::transaction(function () use (
      $senderWallet,
      $merchantWallet,
      $amount,
      $validated
    ) {
      $description = $validated['description']
        ?? 'Pembayaran produk';

      $senderWallet->deductBalance(
        $amount,
        $description,
        'transfer'
      );

      $merchantWallet->addBalance(
        $amount,
        'Transfer dari user'
      );
    });

    return response()->json([
      'message' => 'Transfer berhasil.',
    ]);
  }

  public function deduct(Request $request)
  {
    $validated = $request->validate([
      'amount' => 'required|numeric|min:1',
    ]);

    $wallet = $request->user()->wallet;

    $wallet->deductBalance(
      $validated['amount'],
      'Pengurangan saldo'
    );

    return response()->json([
      'message' => 'Saldo berhasil dikurangi.',
      'balance' => $wallet->fresh()->balance,
    ]);
  }

  public function checkout(Request $request)
  {
    $user = $request->user();

    $senderWallet = $user->wallet;

    if (!$senderWallet) {
      return response()->json([
        'message' => 'Wallet pembeli tidak ditemukan.',
      ], 404);
    }

    $cartItems = Cart::with('product')
      ->where('user_id', $user->id)
      ->get();

    if ($cartItems->isEmpty()) {
      throw ValidationException::withMessages([
        'cart' => 'Keranjang masih kosong.',
      ]);
    }

    // Kelompokkan produk berdasarkan merchant
    $merchantGroups = $cartItems->groupBy(
      fn ($item) => $item->product->merchant_id
    );

    $total = 0;

    foreach ($cartItems as $item) {
      if (!$item->product) {
        throw ValidationException::withMessages([
          'cart' => 'Ada produk yang sudah tidak tersedia.',
        ]);
      }

      $total += $item->product->price * $item->quantity;
    }

    $total = round($total, 2);

    DB::transaction(function () use (
      $user,
      $senderWallet,
      $merchantGroups,
      $total
    ) {
      // Pastikan saldo pembeli mencukupi
      $senderWallet->refresh();

      if ($senderWallet->balance < $total) {
        throw ValidationException::withMessages([
          'balance' => 'Saldo tidak mencukupi.',
        ]);
      }

      // Potong saldo pembeli satu kali
      $senderWallet->deductBalance(
        $total,
        'Pembayaran cart',
        'transfer'
      );

      // Distribusikan pembayaran ke setiap merchant
      foreach ($merchantGroups as $merchantId => $items) {
        $merchant = Merchant::with('user.wallet')
          ->findOrFail($merchantId);

        $merchantWallet = $merchant->user->wallet;

        if (!$merchantWallet) {
          throw ValidationException::withMessages([
            'wallet' => 'Wallet merchant tidak ditemukan.',
          ]);
        }

        if ($merchantWallet->id === $senderWallet->id) {
          throw ValidationException::withMessages([
            'merchant' => 'Tidak bisa membeli produk sendiri.',
          ]);
        }

        $merchantTotal = 0;

        foreach ($items as $item) {
          $merchantTotal +=
            $item->product->price * $item->quantity;
        }

        $merchantTotal = round($merchantTotal, 2);

        $merchantWallet->addBalance(
          $merchantTotal,
          'Pembayaran cart dari user',
          'transfer'
        );
      }

      // Hapus seluruh cart setelah pembayaran berhasil
      Cart::where('user_id', $user->id)->delete();
    });

    return response()->json([
      'message' => 'Checkout berhasil.',
      'total' => $total,
      'balance' => $senderWallet->fresh()->balance,
    ]);
  }
}