<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class WalletTransactionController extends Controller
{
  public function index(Request $request)
  {
    $wallet = $request->user()->wallet;

    if (!$wallet) {
      return response()->json([
        'message' => 'Wallet tidak ditemukan.',
      ], 404);
    }

    $transactions = $wallet->transactions()
      ->latest()
      ->paginate(10);

    return response()->json([
      'message' => 'Riwayat transaksi berhasil diambil.',
      'data' => $transactions->items(),
      'pagination' => [
        'current_page' => $transactions->currentPage(),
        'last_page' => $transactions->lastPage(),
        'per_page' => $transactions->perPage(),
        'total' => $transactions->total(),
      ],
    ]);
  }
}
