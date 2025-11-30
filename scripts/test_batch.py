import requests
import argparse
import json
import os
import sys

def test_batch_extraction(file_paths, host="http://localhost:8000"):
    """
    Test POST /extract/batch with multiple files
    """
    print(f"🚀 Testing Batch Extraction with {len(file_paths)} files...")
    
    url = f"{host}/extract/batch"
    files = []
    opened_files = []
    
    try:
        # Prepare files for upload
        for path in file_paths:
            if not os.path.exists(path):
                print(f"❌ File not found: {path}")
                continue
                
            f = open(path, "rb")
            opened_files.append(f)
            files.append(("files", (os.path.basename(path), f, "application/pdf")))
        
        if not files:
            print("❌ No valid files to upload")
            return

        print(f"📤 Sending request to {url}...")
        response = requests.post(url, files=files)
        
        if response.status_code == 200:
            result = response.json()
            print("\n✅ Batch Processing Complete!")
            print(f"   Total Processed: {result['total_processed']}")
            print(f"   Successful: {result['successful']}")
            print(f"   Failed: {result['failed']}")
            
            print("\n📄 Results:")
            for item in result['results']:
                print(f"   - {item['data']['company_name']} (Score: {item['data_quality_score']}, Grade: {item['quality_grade']})")
                
            if result['errors']:
                print("\n⚠️ Errors:")
                for err in result['errors']:
                    print(f"   - {err['filename']}: {err['error']}")
        else:
            print(f"❌ Request Failed: {response.status_code}")
            print(response.text)
            
    except Exception as e:
        print(f"❌ Error: {e}")
    finally:
        # Close all file handles
        for f in opened_files:
            f.close()

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Test Batch Extraction")
    parser.add_argument("files", nargs="+", help="Paths to KYC documents")
    parser.add_argument("--host", default="http://localhost:8000", help="API Host URL")
    
    args = parser.parse_args()
    test_batch_extraction(args.files, args.host)
