from kyc_extractor.db.database import SessionLocal
from kyc_extractor.db.models import Extraction
from datetime import datetime

def fix_null_timestamps():
    db = SessionLocal()
    try:
        # Find records with NULL uploaded_at
        null_uploads = db.query(Extraction).filter(Extraction.uploaded_at == None).all()
        print(f"Found {len(null_uploads)} records with NULL uploaded_at")
        
        for ext in null_uploads:
            print(f"Fixing ID {ext.id}: request_id={ext.request_id}")
            # Use created_at if available, otherwise use current time
            ext.uploaded_at = datetime.utcnow()
        
        # Also fix the MSME_Certificate type
        invalid_types = db.query(Extraction).filter(Extraction.document_type == "MSME_Certificate").all()
        print(f"\nFound {len(invalid_types)} records with MSME_Certificate")
        for ext in invalid_types:
            print(f"Fixing ID {ext.id}: 'MSME_Certificate' -> 'MSME'")
            ext.document_type = "MSME"
        
        db.commit()
        print("\n✅ All records fixed successfully.")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    fix_null_timestamps()
