from kyc_extractor.db.database import SessionLocal
from kyc_extractor.db.models import Extraction

def fix_data():
    db = SessionLocal()
    try:
        # Find records with invalid document types
        invalid_types = ["MSME_CERTIFICATE", "MSME_Certificate", "UDYAM_REGISTRATION", "UDYAM"]
        
        extractions = db.query(Extraction).filter(Extraction.document_type.in_(invalid_types)).all()
        print(f"Found {len(extractions)} records to fix.")
        
        for ext in extractions:
            print(f"Fixing ID {ext.id}: '{ext.document_type}' -> 'MSME'")
            ext.document_type = "MSME"
            
        db.commit()
        print("Data fixed successfully.")
        
    except Exception as e:
        print(f"Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    fix_data()
