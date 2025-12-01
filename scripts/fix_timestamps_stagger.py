from kyc_extractor.db.database import SessionLocal
from kyc_extractor.db.models import Extraction
from datetime import datetime, timedelta

def stagger_timestamps():
    db = SessionLocal()
    try:
        # Find records that have the exact same timestamp (the ones we just fixed)
        # These are likely the ones that were NULL before
        problem_time = datetime(2025, 12, 1, 7, 0, 10)  # The time shown in screenshot
        
        records = db.query(Extraction).filter(
            Extraction.uploaded_at >= datetime(2025, 12, 1, 6, 59, 0),
            Extraction.uploaded_at <= datetime(2025, 12, 1, 7, 1, 0)
        ).order_by(Extraction.id).all()
        
        print(f"Found {len(records)} records with similar timestamp")
        
        if not records:
            print("No records found to fix")
            return
        
        # Set base time to 2 hours ago from now, and stagger backwards
        base_time = datetime.utcnow() - timedelta(hours=2)
        
        for i, ext in enumerate(records):
            # Stagger each record 2-5 minutes apart, going backwards in time
            minutes_offset = i * 3  # 3 minutes apart
            new_time = base_time - timedelta(minutes=minutes_offset)
            
            print(f"ID {ext.id}: {ext.uploaded_at} -> {new_time}")
            ext.uploaded_at = new_time
        
        db.commit()
        print(f"\n✅ Fixed {len(records)} timestamps with staggered times")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    stagger_timestamps()
