import sys
import os

# Add the project root to python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from PIL import Image
from pdf2image import convert_from_path
from kyc_extractor.core.gemini import gemini_client
import argparse

def main():
    parser = argparse.ArgumentParser(description="Test Gemini Extraction on a local image or PDF")
    parser.add_argument("file_path", help="Path to the file (JPG/PNG/PDF)")
    args = parser.parse_args()

    if not os.path.exists(args.file_path):
        print(f"Error: File not found at {args.file_path}")
        return

    try:
        print(f"Processing {args.file_path}...")
        
        # Handle PDF
        if args.file_path.lower().endswith('.pdf'):
            print("Detected PDF. Converting first page to image...")
            images = convert_from_path(args.file_path)
            if not images:
                print("Error: Could not convert PDF to image.")
                return
            image = images[0] # Take the first page
        else:
            image = Image.open(args.file_path)

        result = gemini_client.extract_data(image)
        
        import json
        print("\n--- Extraction Result ---")
        print(json.dumps(result, indent=2))
        
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    main()
