import requests
import json

def test_page2():
    login_url = "http://localhost:8000/auth/login"
    data = {
        "username": "testadmin@example.com",
        "password": "password123" 
    }
    
    try:
        response = requests.post(login_url, data=data)
        if response.status_code != 200:
            print(f"Login failed: {response.text}")
            return

        token = response.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        
        # Test page 2 with skip=10, limit=10
        print("Testing page 2 (skip=10, limit=10)...")
        history_url = "http://localhost:8000/history?skip=10&limit=10"
        resp = requests.get(history_url, headers=headers)
        
        print(f"Status Code: {resp.status_code}")
        
        if resp.status_code == 200:
            data = resp.json()
            print(f"Total: {data['total']}")
            print(f"Items returned: {len(data['items'])}")
            print("\nFirst item:")
            if data['items']:
                item = data['items'][0]
                print(json.dumps({
                    'request_id': item['request_id'],
                    'document_type': item['document_type'],
                    'company_name': item['data']['company_name'],
                    'uploaded_at': item['uploaded_at']
                }, indent=2))
        else:
            print(f"Error: {resp.text}")
            
    except Exception as e:
        import traceback
        print(f"Error: {e}")
        traceback.print_exc()

if __name__ == "__main__":
    test_page2()
