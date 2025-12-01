from kyc_extractor.db.database import SessionLocal
from kyc_extractor.db.models import Extraction
from sqlalchemy import desc
import json

def inspect_data():
    db = SessionLocal()
    try:
        extractions = db.query(Extraction).order_by(desc(Extraction.uploaded_at)).limit(20).all()
        print(f"Found {len(extractions)} extractions.")
        
        for ext in extractions:
            print(f"ID: {ext.id}, Type: '{ext.document_type}'")
            
            allowed_types = ["GST_CERTIFICATE", "PAN_CARD", "FSSAI", "INCORPORATION_CERT", "MSME", "SHOP_ESTABLISHMENT", "OTHER"]
            if ext.document_type not in allowed_types:
                print(f"WARNING: Invalid document_type '{ext.document_type}' found!")
            
            # Check if address_json is a string (which would cause Pydantic validation error)
            if isinstance(ext.address_json, str):
                print("WARNING: address_json is a string! It should be a dict/list.")
                try:
                    parsed = json.loads(ext.address_json)
                    print(f"Parsed: {parsed}")
                except:
                    print("Could not parse address_json string.")
            
            print("-" * 20)
            
    finally:
        db.close()

if __name__ == "__main__":
    inspect_data()
