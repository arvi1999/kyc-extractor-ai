from kyc_extractor.db.database import SessionLocal
from kyc_extractor.db.models import Extraction
from sqlalchemy import desc

def inspect_records():
    db = SessionLocal()
    try:
        # Get records 10-20 (page 2 with limit=10)
        extractions = db.query(Extraction).order_by(desc(Extraction.uploaded_at)).offset(10).limit(10).all()
        
        print(f"Found {len(extractions)} records at offset 10:")
        for i, ext in enumerate(extractions, start=10):
            print(f"\n--- Record {i+1} (ID: {ext.id}) ---")
            print(f"Request ID: {ext.request_id}")
            print(f"Document Type: '{ext.document_type}'")
            print(f"Company Name: {ext.company_name}")
            print(f"Address JSON type: {type(ext.address_json)}")
            print(f"Confidence: {ext.confidence}")
            print(f"Data Quality Score: {ext.data_quality_score}")
            print(f"Uploaded At: {ext.uploaded_at}")
            
            # Check for potential issues
            if ext.document_type not in ["GST_CERTIFICATE", "PAN_CARD", "FSSAI", "INCORPORATION_CERT", "MSME", "SHOP_ESTABLISHMENT", "OTHER"]:
                print(f"⚠️  INVALID DOCUMENT TYPE: '{ext.document_type}'")
            
            if isinstance(ext.address_json, str):
                print(f"⚠️  ADDRESS_JSON IS STRING, NOT DICT")
                
    finally:
        db.close()

if __name__ == "__main__":
    inspect_records()
