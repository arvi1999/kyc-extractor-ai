from kyc_extractor.db.database import engine
from sqlalchemy import text, desc
from sqlalchemy.orm import Session
from kyc_extractor.db.database import SessionLocal

def get_avg_processing_time_from_db():
    """Get average processing time from recent extractions"""
    db = SessionLocal()
    try:
        # Get last 7 extractions with processing times
        query = text("""
            SELECT AVG(processing_time_ms) as avg_time
            FROM (
                SELECT processing_time_ms 
                FROM extractions 
                WHERE processing_time_ms IS NOT NULL 
                  AND processing_time_ms > 0
                ORDER BY uploaded_at DESC 
                LIMIT 7
            ) recent
        """)
        
        result = db.execute(query).scalar()
        
        if result:
            print(f"Average processing time: {int(result)}ms ({round(result/1000, 1)}s)")
            return int(result)
        else:
            print("No processing time data found, using default: 3000ms (3s)")
            return 3000
            
    finally:
        db.close()

if __name__ == "__main__":
    get_avg_processing_time_from_db()
