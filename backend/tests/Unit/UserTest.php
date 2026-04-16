<?php

namespace Tests\Unit;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UserTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_has_full_name_attribute()
    {
        $user = User::factory()->create([
            'name' => 'John Doe',
        ]);

        $this->assertEquals('John Doe', $user->name);
    }

    public function test_user_factory_creates_valid_user()
    {
        $user = User::factory()->create();

        $this->assertNotNull($user->email);
        $this->assertNotNull($user->name);
    }
}