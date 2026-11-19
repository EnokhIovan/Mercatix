<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Wallet;

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