import requests
import argparse
import sys
import os

def test_auth_flow(host="http://localhost:8000", email="admin@example.com", password="admin123"):
    """
    Test the full authentication flow
    """
    print(f"🚀 Testing Auth Flow on {host}...")
    
    # 1. Test Login
    print("\n1️⃣  Testing Login (POST /auth/login)...")
    login_url = f"{host}/auth/login"
    try:
        response = requests.post(
            login_url, 
            data={"username": email, "password": password}
        )
        
        if response.status_code == 200:
            token_data = response.json()
            access_token = token_data.get("access_token")
            print("✅ Login Successful!")
            print(f"   Token Type: {token_data.get('token_type')}")
            print(f"   Access Token: {access_token[:20]}... (truncated)")
        else:
            print(f"❌ Login Failed: {response.status_code}")
            print(response.text)
            return
            
    except Exception as e:
        print(f"❌ Error during login: {e}")
        return

    # 2. Test Protected Endpoint (GET /history) with Token
    print("\n2️⃣  Testing Protected Endpoint (GET /history) WITH Token...")
    history_url = f"{host}/history"
    headers = {"Authorization": f"Bearer {access_token}"}
    
    try:
        response = requests.get(history_url, headers=headers)
        
        if response.status_code == 200:
            print("✅ Access Granted!")
            data = response.json()
            print(f"   Total Items: {data.get('total')}")
        else:
            print(f"❌ Access Denied: {response.status_code}")
            print(response.text)
            
    except Exception as e:
        print(f"❌ Error accessing protected route: {e}")

    # 3. Test Protected Endpoint WITHOUT Token
    print("\n3️⃣  Testing Protected Endpoint WITHOUT Token...")
    try:
        response = requests.get(history_url)
        
        if response.status_code == 401:
            print("✅ Access Correctly Denied (401 Unauthorized)")
        else:
            print(f"❌ Unexpected Status: {response.status_code}")
            
    except Exception as e:
        print(f"❌ Error: {e}")

    # 4. Test User Management (Admin Only)
    print("\n4️⃣  Testing Admin User List (GET /users)...")
    users_url = f"{host}/users"
    try:
        response = requests.get(users_url, headers=headers)
        
        if response.status_code == 200:
            users = response.json()
            print(f"✅ Users List Retrieved ({len(users)} users)")
            for u in users:
                print(f"   - {u['email']} ({u['role']})")
        else:
            print(f"❌ Failed to list users: {response.status_code}")
            
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Test Auth Flow")
    parser.add_argument("--host", default="http://localhost:8000", help="API Host URL")
    parser.add_argument("--email", default="admin@example.com", help="Admin Email")
    parser.add_argument("--password", default="admin123", help="Admin Password")
    
    args = parser.parse_args()
    test_auth_flow(args.host, args.email, args.password)
