import requests
import json
from datetime import datetime

def test_history_pagination():
    # Login first to get token
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
        
        print("Fetching history (page 1, limit 5)...")
        history_url = "http://localhost:8000/history?skip=0&limit=5"
        resp = requests.get(history_url, headers=headers)
        
        if resp.status_code == 200:
            data = resp.json()
            print(f"Total records: {data['total']}")
            print(f"Returned items: {len(data['items'])}")
            
            items = data['items']
            if items:
                print("\nChecking sorting (should be DESC):")
                dates = []
                for item in items:
                    uploaded_at = item['uploaded_at']
                    print(f"- {uploaded_at}")
                    if uploaded_at:
                        dates.append(datetime.fromisoformat(uploaded_at))
                
                # Check if sorted
                is_sorted = all(dates[i] >= dates[i+1] for i in range(len(dates)-1))
                print(f"\nIs sorted correctly? {is_sorted}")
                
                if not is_sorted:
                    print("ERROR: Items are NOT sorted correctly!")
            
            # Check page 2
            if data['total'] > 5:
                print("\nFetching page 2...")
                history_url_2 = "http://localhost:8000/history?skip=5&limit=5"
                resp_2 = requests.get(history_url_2, headers=headers)
                data_2 = resp_2.json()
                print(f"Page 2 items: {len(data_2['items'])}")
                
        else:
            print(f"History API failed: {resp.status_code}")
            print(resp.text)
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_history_pagination()
