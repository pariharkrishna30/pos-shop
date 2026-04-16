<?php

use App\Models\Category;
use App\Models\Product;
use App\Models\Sale;
use App\Models\SaleItem;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;

Route::middleware([])->withoutMiddleware([\Illuminate\Foundation\Http\Middleware\VerifyCsrfToken::class])->group(function () {

    Route::post('/api/register', function (Request $request) {

        $validator = Validator::make($request->all(), [
            'name' => 'required|string',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:6|confirmed',
        ]);

        if ($validator->fails()) {
            return apiResponse(['errors' => $validator->errors()], 422);
        }

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => 'cashier',
            'api_token' => Str::random(80),
        ]);

        return apiResponse([
            'token' => $user->api_token,
            'user' => $user->only(['id', 'name', 'email', 'role'])
        ], 201);
    });

    Route::get('/api/profile', function (Request $request) {

        $user = apiUser($request);

        if (!$user) {
            return apiResponse(['message' => 'Unauthorized'], 401);
        }

        return apiResponse(['user' => $user->only(['id', 'name', 'email', 'role'])]);
    });
    
    Route::options('/{any}', function () {
        return apiResponse(['status' => 'ok']);
    })->where('any', '.*');

    Route::post('/api/login', function (Request $request) {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'password' => 'required|string|min:6',
        ]);

        if ($validator->fails()) {
            return apiResponse(['errors' => $validator->errors()], 422);
        }

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return apiResponse(['message' => 'Invalid credentials'], 401);
        }

        $user->api_token = Str::random(80);
        $user->save();

        return apiResponse([
            'token' => $user->api_token,
            'user' => $user->only(['id', 'name', 'email', 'role']),
        ]);
    });

    Route::post('/api/logout', function (Request $request) {
        $user = apiUser($request);

        if (!$user) {
            return apiResponse(['message' => 'Unauthorized'], 401);
        }

        $user->api_token = null;
        $user->save();

        return apiResponse(['message' => 'Logged out']);
    });

    Route::get('/api/me', function (Request $request) {
        $user = apiUser($request);

        if (!$user) {
            return apiResponse(['message' => 'Unauthorized'], 401);
        }

        return apiResponse(['user' => $user->only(['id', 'name', 'email', 'role'])]);
    });

    Route::get('/api/categories', function (Request $request) {
        $user = apiUser($request);
        if (!$user) {
            return apiResponse(['message' => 'Unauthorized'], 401);
        }

        $categories = Category::withCount('products')->orderBy('name')->get();

        return apiResponse(['categories' => $categories]);
    });

    Route::post('/api/categories', function (Request $request) {
        $user = requireAdmin($request);
        if ($user instanceof \Illuminate\Http\JsonResponse) {
            return $user;
        }

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255|unique:categories,name',
            'description' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return apiResponse(['errors' => $validator->errors()], 422);
        }

        $category = Category::create($validator->validated());

        return apiResponse(['category' => $category], 201);
    });

    Route::put('/api/categories/{category}', function (Request $request, Category $category) {
        $user = requireAdmin($request);
        if ($user instanceof \Illuminate\Http\JsonResponse) {
            return $user;
        }

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255|unique:categories,name,' . $category->id,
            'description' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return apiResponse(['errors' => $validator->errors()], 422);
        }

        $category->update($validator->validated());

        return apiResponse(['category' => $category]);
    });

    Route::delete('/api/categories/{category}', function (Request $request, Category $category) {
        $user = requireAdmin($request);
        if ($user instanceof \Illuminate\Http\JsonResponse) {
            return $user;
        }

        $category->delete();

        return apiResponse(['message' => 'Category deleted']);
    });

    Route::get('/api/products', function (Request $request) {
        $user = apiUser($request);
        if (!$user) {
            return apiResponse(['message' => 'Unauthorized'], 401);
        }

        $query = Product::with('category');

        if ($request->filled('barcode')) {
            $query->where('barcode', $request->barcode);
        }

        if ($request->filled('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        if ($request->filled('search')) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        return apiResponse(['products' => $query->orderBy('name')->get()]);
    });

    Route::get('/api/products/{product}', function (Request $request, Product $product) {
        $user = apiUser($request);
        if (!$user) {
            return apiResponse(['message' => 'Unauthorized'], 401);
        }

        return apiResponse(['product' => $product->load('category')]);
    });

    Route::post('/api/products', function (Request $request) {
        $user = requireAdmin($request);
        if ($user instanceof \Illuminate\Http\JsonResponse) {
            return $user;
        }

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'barcode' => 'required|string|max:255|unique:products,barcode',
            'price' => 'required|numeric|min:0',
            'stock_quantity' => 'required|integer|min:0',
            'category_id' => 'nullable|exists:categories,id',
            'image' => 'nullable|string|max:255',
        ]);

        if ($validator->fails()) {
            return apiResponse(['errors' => $validator->errors()], 422);
        }

        $product = Product::create($validator->validated());

        return apiResponse(['product' => $product], 201);
    });

    Route::put('/api/products/{product}', function (Request $request, Product $product) {
        $user = requireAdmin($request);
        if ($user instanceof \Illuminate\Http\JsonResponse) {
            return $user;
        }

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'barcode' => 'required|string|max:255|unique:products,barcode,' . $product->id,
            'price' => 'required|numeric|min:0',
            'stock_quantity' => 'required|integer|min:0',
            'category_id' => 'nullable|exists:categories,id',
            'image' => 'nullable|string|max:255',
        ]);

        if ($validator->fails()) {
            return apiResponse(['errors' => $validator->errors()], 422);
        }

        $product->update($validator->validated());

        return apiResponse(['product' => $product]);
    });

    Route::delete('/api/products/{product}', function (Request $request, Product $product) {
        $user = requireAdmin($request);
        if ($user instanceof \Illuminate\Http\JsonResponse) {
            return $user;
        }

        $product->delete();

        return apiResponse(['message' => 'Product deleted']);
    });

    Route::get('/api/users', function (Request $request) {
        $user = requireAdmin($request);
        if ($user instanceof \Illuminate\Http\JsonResponse) {
            return $user;
        }

        return apiResponse(['users' => User::orderBy('name')->get(['id', 'name', 'email', 'role'])]);
    });

    Route::post('/api/users', function (Request $request) {
        $user = requireAdmin($request);
        if ($user instanceof \Illuminate\Http\JsonResponse) {
            return $user;
        }

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:6',
            'role' => 'required|in:admin,cashier',
        ]);

        if ($validator->fails()) {
            return apiResponse(['errors' => $validator->errors()], 422);
        }

        $newUser = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => $request->password,
            'role' => $request->role,
        ]);

        return apiResponse(['user' => $newUser], 201);
    });

    Route::put('/api/users/{user}', function (Request $request, User $user) {
        $admin = requireAdmin($request);
        if ($admin instanceof \Illuminate\Http\JsonResponse) {
            return $admin;
        }

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $user->id,
            'password' => 'nullable|string|min:6',
            'role' => 'required|in:admin,cashier',
        ]);

        if ($validator->fails()) {
            return apiResponse(['errors' => $validator->errors()], 422);
        }

        $data = $validator->validated();
        if (empty($data['password'])) {
            unset($data['password']);
        }

        $user->update($data);

        return apiResponse(['user' => $user]);
    });

    Route::delete('/api/users/{user}', function (Request $request, User $user) {
        $admin = requireAdmin($request);
        if ($admin instanceof \Illuminate\Http\JsonResponse) {
            return $admin;
        }

        $user->delete();

        return apiResponse(['message' => 'User deleted']);
    });

    Route::post('/api/checkout', function (Request $request) {
        $user = apiUser($request);
        if (!$user) {
            return apiResponse(['message' => 'Unauthorized'], 401);
        }

        $validator = Validator::make($request->all(), [
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'payment_method' => 'required|string|max:100',
            'discount' => 'nullable|numeric|min:0',
        ]);

        if ($validator->fails()) {
            return apiResponse(['errors' => $validator->errors()], 422);
        }

        $data = $validator->validated();
        $discount = $data['discount'] ?? 0;

        $sale = DB::transaction(function () use ($data, $user, $discount) {
            $subtotal = 0;
            $items = [];

            foreach ($data['items'] as $itemPayload) {
                $product = Product::lockForUpdate()->find($itemPayload['product_id']);

                if (!$product) {
                    throw new \Exception('Product not found');
                }

                if ($product->stock_quantity < $itemPayload['quantity']) {
                    throw new \Exception('Product "' . $product->name . '" is out of stock or quantity is too high.');
                }

                $lineTotal = $product->price * $itemPayload['quantity'];
                $subtotal += $lineTotal;

                $items[] = [
                    'product' => $product,
                    'quantity' => $itemPayload['quantity'],
                    'unit_price' => $product->price,
                    'total_price' => $lineTotal,
                ];

                $product->decrement('stock_quantity', $itemPayload['quantity']);
            }

            $tax = round($subtotal * 0.10, 2);
            $total = round($subtotal + $tax - $discount, 2);

            $sale = Sale::create([
                'user_id' => $user->id,
                'subtotal' => $subtotal,
                'tax' => $tax,
                'discount' => $discount,
                'total' => $total,
                'payment_method' => $data['payment_method'],
            ]);

            foreach ($items as $item) {
                SaleItem::create([
                    'sale_id' => $sale->id,
                    'product_id' => $item['product']->id,
                    'quantity' => $item['quantity'],
                    'unit_price' => $item['unit_price'],
                    'total_price' => $item['total_price'],
                ]);
            }

            return $sale->load('items.product');
        });

        return apiResponse(['sale' => $sale], 201);
    });

    Route::get('/api/reports/sales', function (Request $request) {
        $user = apiUser($request);
        if (!$user) {
            return apiResponse(['message' => 'Unauthorized'], 401);
        }

        $period = $request->query('period', 'daily');
        $start = match ($period) {
            'weekly' => now()->subDays(7),
            'monthly' => now()->subMonth(),
            default => now()->subDay(),
        };

        $sales = Sale::where('created_at', '>=', $start)
            ->orderBy('created_at', 'desc')
            ->get();

        $totalRevenue = $sales->sum('total');
        $orderCount = $sales->count();

        return apiResponse([
            'period' => $period,
            'total_revenue' => $totalRevenue,
            'order_count' => $orderCount,
            'sales' => $sales,
        ]);
    });

    Route::get('/api/reports/top-products', function (Request $request) {
        $user = apiUser($request);
        if (!$user) {
            return apiResponse(['message' => 'Unauthorized'], 401);
        }

        $topProducts = SaleItem::select('product_id', DB::raw('SUM(quantity) as total_quantity'))
            ->groupBy('product_id')
            ->orderByDesc('total_quantity')
            ->limit(8)
            ->with('product')
            ->get();

        return apiResponse(['top_products' => $topProducts]);
    });

    Route::get('/api/reports/inventory', function (Request $request) {
        $user = apiUser($request);
        if (!$user) {
            return apiResponse(['message' => 'Unauthorized'], 401);
        }

        $threshold = $request->query('threshold', 10);

        $lowStock = Product::where('stock_quantity', '<=', $threshold)
            ->with('category')
            ->orderBy('stock_quantity')
            ->get();

        return apiResponse(['low_stock' => $lowStock]);
    });
});
