<?php

use App\Models\User;
use Illuminate\Http\Request;

if (!function_exists('apiResponse')) {
    function apiResponse(array $payload, int $status = 200)
    {
        return response()->json($payload, $status)
            ->header('Access-Control-Allow-Origin', '*')
            ->header('Access-Control-Allow-Headers', 'Authorization,Content-Type')
            ->header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
    }
}

if (!function_exists('apiUser')) {
    function apiUser(Request $request): ?User
    {
        $authorization = $request->header('Authorization', '');

        if (!str_starts_with($authorization, 'Bearer ')) {
            return null;
        }

        return User::where('api_token', substr($authorization, 7))->first();
    }
}

if (!function_exists('requireApiUser')) {
    function requireApiUser(Request $request)
    {
        $user = apiUser($request);

        if (!$user) {
            return apiResponse(['message' => 'Unauthorized'], 401);
        }

        return $user;
    }
}

if (!function_exists('requireAdmin')) {
    function requireAdmin(Request $request)
    {
        $user = apiUser($request);

        if (!$user) {
            return apiResponse(['message' => 'Unauthorized'], 401);
        }

        if ($user->role !== 'admin') {
            return apiResponse(['message' => 'Forbidden'], 403);
        }

        return $user;
    }
}