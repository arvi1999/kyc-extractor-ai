import requests
import argparse
import json
import time
import sys
import os

# Add project root to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

def test_v2_features(file_path, host="http://localhost:8000"):
    """
    Test v0.2.0 features:
    1. Extract document -> Check validation & scoring
    2. Get extraction by ID -> Verify persistence
    3. Get history -> Verify indexing
    """
    print(f"🚀 Testing v0.2.0 features with: {file_path}")
    
    # 1. Test /extract
    print("\n1️⃣  Testing POST /extract ...")
    try:
        with open(file_path, "rb") as f:
            files = {"file": f}
            response = requests.post(f"{host}/extract", files=files)
            
        if response.status_code == 200:
            data = response.json()
            request_id = data.get("request_id")
            print("✅ Extraction Successful!")
            print(f"   Request ID: {request_id}")
            print(f"   Quality Score: {data.get('data_quality_score')}/100 (Grade: {data.get('quality_grade')})")
            
            validation = data.get("validation_results", {})
            print("   Validation Results:")
            for field, result in validation.items():
                status = "✅" if result.get("valid") else "❌"
                print(f"     - {field}: {status} {result.get('value', 'N/A')}")
        else:
            print(f"❌ Extraction Failed: {response.text}")
            return
            
    except Exception as e:
        print(f"❌ Error: {e}")
        return

    # 2. Test /extract/{request_id}
    print(f"\n2️⃣  Testing GET /extract/{request_id} ...")
    try:
        response = requests.get(f"{host}/extract/{request_id}")
        if response.status_code == 200:
            fetched_data = response.json()
            if fetched_data["request_id"] == request_id:
                print("✅ Fetch by ID Successful!")
                print("   Data persisted correctly in MySQL.")
            else:
                print("❌ ID Mismatch!")
        else:
            print(f"❌ Fetch Failed: {response.text}")
    except Exception as e:
        print(f"❌ Error: {e}")

    # 3. Test /history
    print("\n3️⃣  Testing GET /history ...")
    try:
        response = requests.get(f"{host}/history?limit=5")
        if response.status_code == 200:
            history = response.json()
            print(f"✅ History Fetch Successful! Total items: {history['total']}")
            
            # Check if our recent request is in history
            found = False
            for item in history["items"]:
                if item["request_id"] == request_id:
                    found = True
                    break
            
            if found:
                print("   Recent extraction found in history.")
            else:
                print("⚠️ Recent extraction NOT found in top 5 history (might be pagination).")
        else:
            print(f"❌ History Failed: {response.text}")
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Test v0.2.0 API Features")
    parser.add_argument("file_path", help="Path to a KYC document (PDF or Image)")
    parser.add_argument("--host", default="http://localhost:8000", help="API Host URL")
    
    args = parser.parse_args()
    test_v2_features(args.file_path, args.host)
