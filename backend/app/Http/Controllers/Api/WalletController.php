<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Validation\Rule;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\Wallet;
use App\Models\Merchant;

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
}