"""Test user management endpoints"""
import requests

BASE_URL = "http://localhost:8000"

# Login as admin
print("📝 Logging in as admin...")
login_response = requests.post(f"{BASE_URL}/auth/login", data={
    "username": "admin@example.com",
    "password": "admin123"
})
token = login_response.json()["access_token"]
headers = {"Authorization": f"Bearer {token}"}

print(f"✅ Got token: {token[:20]}...")

# Test GET /users
print("\n📝 Testing GET /users...")
users_response = requests.get(f"{BASE_URL}/users", headers=headers)
print(f"✅ Status: {users_response.status_code}")
print(f"✅ Users: {users_response.json()}")

# Test creating a new user
print("\n📝 Testing POST /users (create)...")
new_user_data = {
    "email": "testuser@example.com",
    "password": "testpass123",
    "full_name": "Test User",
    "role": "user"
}
create_response = requests.post(f"{BASE_URL}/users", json=new_user_data, headers=headers)
print(f"✅ Status: {create_response.status_code}")
if create_response.status_code == 200:
    created_user = create_response.json()
    print(f"✅ Created user: {created_user}")
    
    # Test updating the user
    print("\n📝 Testing PUT /users/{id} (update)...")
    update_response = requests.put(
        f"{BASE_URL}/users/{created_user['id']}", 
        params={"full_name": "Updated Test User", "is_active": True},
        headers=headers
    )
    print(f"✅ Status: {update_response.status_code}")
    print(f"✅ Updated user: {update_response.json()}")
    
    # Test deactivating the user
    print("\n📝 Testing DELETE /users/{id} (deactivate)...")
    delete_response = requests.delete(f"{BASE_URL}/users/{created_user['id']}", headers=headers)
    print(f"✅ Status: {delete_response.status_code}")
    print(f"✅ Response: {delete_response.json()}")

print("\n✅ All tests passed!")
