<?php
namespace App\Http\Controllers;

use App\Models\User;
use App\Models\ApiToken;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
  public function login(Request $request)
  {
    $credentials = $request->validate([
      'email' => ['required', 'email'],
      'password' => ['required'],
    ]);

    $user = User::where('email', $credentials['email'])->first();

    if (!$user || !Hash::check($credentials['password'], $user->password)) {
      return response()->json([
        'message' => 'Email atau password salah.',
      ], 401);
    }

    $token = bin2hex(random_bytes(32));

    ApiToken::create([
      'user_id' => $user->id,
      'token_hash' => hash('sha256', $token),
      'expires_at' => now()->addDays(7),
    ]);

    return response()->json([
      'message' => 'Login berhasil.',
      'token' => $token,
      'user' => [
        'id' => $user->id,
        'name' => $user->name,
        'email' => $user->email,
        'role' => $user->role,
      ],
    ]);
  }

  public function logout(Request $request)
  {
    $token = $request->bearerToken();

    ApiToken::where('token_hash', hash('sha256', $token))
      ->delete();

    return response()->json([
      'message' => 'Logout berhasil.',
    ]);
  }

  public function user(Request $request)
  {
    return response()->json([
      'user' => $request->user(),
    ]);
  }
}
