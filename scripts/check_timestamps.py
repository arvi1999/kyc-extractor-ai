from kyc_extractor.db.database import SessionLocal
from kyc_extractor.db.models import Extraction
from sqlalchemy import desc
from datetime import datetime

def check_recent_timestamps():
    db = SessionLocal()
    try:
        # Get last 5 records
        recent = db.query(Extraction).order_by(desc(Extraction.id)).limit(5).all()
        
        print("Last 5 uploads:")
        print(f"Current UTC time: {datetime.utcnow()}")
        print(f"Current local time: {datetime.now()}")
        print("-" * 80)
        
        for ext in recent:
            print(f"\nID: {ext.id}")
            print(f"Request ID: {ext.request_id}")
            print(f"Company: {ext.company_name}")
            print(f"uploaded_at (from DB): {ext.uploaded_at}")
            print(f"uploaded_at type: {type(ext.uploaded_at)}")
            if ext.uploaded_at:
                print(f"uploaded_at timezone: {ext.uploaded_at.tzinfo}")
                
    finally:
        db.close()

if __name__ == "__main__":
    check_recent_timestamps()
