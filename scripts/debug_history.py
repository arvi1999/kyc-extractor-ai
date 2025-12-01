import requests
import json

def test_history():
    # Login first to get token
    login_url = "http://localhost:8000/auth/login"
    # Assuming default admin credentials or user credentials
    # I'll try with the admin user created in create_admin.py usually
    # or I can use the user from the previous context if I knew the password.
    # Let's assume admin@example.com / admin123 (common default) or try to find a valid user.
    # Actually, I can use the `test_user_management.py` script logic to get a token.
    
    data = {
        "username": "admin@example.com",
        "password": "password123" # Default from create_admin.py usually
    }
    
    try:
        response = requests.post(login_url, data=data)
        if response.status_code != 200:
            print(f"Login failed: {response.text}")
            # Try with arvind@naukri.com if that was the user
            data["username"] = "arvind@naukri.com"
            response = requests.post(login_url, data=data)
            if response.status_code != 200:
                print(f"Login failed again: {response.text}")
                return

        token = response.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        
        print("Fetching history...")
        history_url = "http://localhost:8000/history"
        resp = requests.get(history_url, headers=headers)
        
        if resp.status_code == 200:
            print("History API success!")
            print(json.dumps(resp.json(), indent=2))
        else:
            print(f"History API failed: {resp.status_code}")
            print(resp.text)
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_history()
