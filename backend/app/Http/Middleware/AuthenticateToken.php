<?php
namespace App\Http\Middleware;

use App\Models\ApiToken;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AuthenticateToken
{
  public function handle(Request $request, Closure $next): Response
  {
    $token = $request->bearerToken();

    if (!$token) {
      return response()->json([
        'message' => 'Unauthenticated.',
      ], 401);
    }

    $apiToken = ApiToken::with('user')
      ->where('token_hash', hash('sha256', $token))
      ->where('expires_at', '>', now())
      ->first();

    if (!$apiToken || !$apiToken->user) {
      return response()->json([
        'message' => 'Invalid or expired token.',
      ], 401);
    }

    $request->setUserResolver(fn () => $apiToken->user);

    return $next($request);
  }
}
