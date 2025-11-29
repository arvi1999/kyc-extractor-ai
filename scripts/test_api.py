import requests
import argparse
import os
import json

def test_api(file_path, url="http://localhost:8000/extract"):
    if not os.path.exists(file_path):
        print(f"Error: File not found at {file_path}")
        return

    print(f"Testing API with {file_path}...")
    try:
        with open(file_path, 'rb') as f:
            files = {'file': (os.path.basename(file_path), f)}
            response = requests.post(url, files=files)
        
        if response.status_code == 200:
            print("\n--- API Success ---")
            print(json.dumps(response.json(), indent=2))
        else:
            print(f"\n--- API Error {response.status_code} ---")
            print(response.text)
            
    except Exception as e:
        print(f"Request failed: {e}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Test CC API Endpoint")
    parser.add_argument("file_path", help="Path to the file (JPG/PNG/PDF)")
    args = parser.parse_args()
    test_api(args.file_path)
