import requests
import sys

BASE_URL = "http://localhost:8000"

def test_inactive_login():
    # 1. Login as admin to create a user
    print("📝 Logging in as admin...")
    login_response = requests.post(f"{BASE_URL}/auth/login", data={
        "username": "admin@example.com",
        "password": "admin123"
    })
    if login_response.status_code != 200:
        print(f"❌ Admin login failed: {login_response.text}")
        return
    
    admin_token = login_response.json()["access_token"]
    headers = {"Authorization": f"Bearer {admin_token}"}
    
    # 2. Create a test user
    print("\n📝 Creating test user...")
    user_data = {
        "email": "inactive_test@example.com",
        "password": "testpass123",
        "full_name": "Inactive Test User",
        "role": "user"
    }
    # Try to create, if exists, just update password to be sure
    create_response = requests.post(f"{BASE_URL}/users", json=user_data, headers=headers)
    
    if create_response.status_code == 200:
        user_id = create_response.json()["id"]
        print(f"✅ Created user with ID: {user_id}")
    elif create_response.status_code == 400 and "already registered" in create_response.text:
        # Get user ID by listing (simplified) or just assume we know it if we ran this before
        # For robustness, let's just get the user by email if we added that endpoint, or list all
        users = requests.get(f"{BASE_URL}/users", headers=headers).json()
        target_user = next((u for u in users if u["email"] == user_data["email"]), None)
        if target_user:
            user_id = target_user["id"]
            print(f"ℹ️ User already exists with ID: {user_id}")
            # Ensure password is correct
            requests.put(f"{BASE_URL}/users/{user_id}/password", params={"new_password": user_data["password"]}, headers=headers)
            # Ensure active initially
            requests.put(f"{BASE_URL}/users/{user_id}", params={"is_active": True}, headers=headers)
        else:
            print("❌ Could not find existing user")
            return
    else:
        print(f"❌ Failed to create user: {create_response.text}")
        return

    # 3. Verify login works when active
    print("\n📝 Testing login (Active)...")
    login_active = requests.post(f"{BASE_URL}/auth/login", data={
        "username": user_data["email"],
        "password": user_data["password"]
    })
    if login_active.status_code == 200:
        print("✅ Login successful when active")
    else:
        print(f"❌ Login failed when active: {login_active.text}")
        return

    # 4. Deactivate user
    print("\n📝 Deactivating user...")
    deactivate_response = requests.delete(f"{BASE_URL}/users/{user_id}", headers=headers)
    if deactivate_response.status_code == 200:
        print("✅ User deactivated")
    else:
        print(f"❌ Failed to deactivate: {deactivate_response.text}")
        return

    # 5. Verify login fails when inactive
    print("\n📝 Testing login (Inactive)...")
    login_inactive = requests.post(f"{BASE_URL}/auth/login", data={
        "username": user_data["email"],
        "password": user_data["password"]
    })
    
    print(f"Status Code: {login_inactive.status_code}")
    print(f"Response: {login_inactive.json()}")
    
    if login_inactive.status_code == 400 and "inactive" in login_inactive.json()["detail"]:
        print("✅ Login blocked with correct message!")
    else:
        print("❌ Login did not fail as expected or wrong message")

if __name__ == "__main__":
    try:
        test_inactive_login()
    except Exception as e:
        print(f"❌ Error: {e}")
