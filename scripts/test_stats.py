"""Test dashboard stats endpoint"""
import requests
import json

BASE_URL = "http://localhost:8000"

def test_dashboard_stats():
    # 1. Login as admin
    print("📝 Logging in as admin...")
    login_response = requests.post(f"{BASE_URL}/auth/login", data={
        "username": "admin@example.com",
        "password": "admin123"
    })
    
    if login_response.status_code != 200:
        print(f"❌ Login failed: {login_response.text}")
        return
        
    token = login_response.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    
    # 2. Get Stats
    print("\n📝 Fetching dashboard stats...")
    response = requests.get(f"{BASE_URL}/stats/dashboard", headers=headers)
    
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print("\n✅ Stats received successfully!")
        print(json.dumps(data, indent=2))
        
        # Basic validation
        assert "summary" in data
        assert "charts" in data
        assert "recent_activity" in data
        assert "daily_trend" in data["charts"]
        assert "quality_distribution" in data["charts"]
        
        print("\n✅ Data structure validated")
    else:
        print(f"❌ Failed to get stats: {response.text}")

if __name__ == "__main__":
    try:
        test_dashboard_stats()
    except Exception as e:
        print(f"❌ Error: {e}")
