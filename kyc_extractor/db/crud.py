from sqlalchemy.orm import Session
from kyc_extractor.db.models import Extraction
from typing import Optional, List
from datetime import datetime, timedelta

def create_extraction(db: Session, extraction_data: dict) -> Extraction:
    """Create a new extraction record"""
    db_extraction = Extraction(**extraction_data)
    db.add(db_extraction)
    db.commit()
    db.refresh(db_extraction)
    return db_extraction

def get_extraction_by_request_id(db: Session, request_id: str) -> Optional[Extraction]:
    """Get extraction by request_id"""
    return db.query(Extraction).filter(Extraction.request_id == request_id).first()

def get_extractions_history(
    db: Session,
    skip: int = 0,
    limit: int = 100,
    document_type: Optional[str] = None,
    days_ago: Optional[int] = None
) -> List[Extraction]:
    """Get extraction history with filters"""
    query = db.query(Extraction)
    
    # Filter by document type if specified
    if document_type:
        query = query.filter(Extraction.document_type == document_type)
    
    # Filter by date range if specified
    if days_ago:
        date_threshold = datetime.utcnow() - timedelta(days=days_ago)
        query = query.filter(Extraction.uploaded_at >= date_threshold)
    
    # Order by most recent first
    query = query.order_by(Extraction.uploaded_at.desc())
    
    return query.offset(skip).limit(limit).all()

def update_extraction(db: Session, request_id: str, update_data: dict) -> Optional[Extraction]:
    """Update an existing extraction record"""
    db_extraction = get_extraction_by_request_id(db, request_id)
    if db_extraction:
        for key, value in update_data.items():
            setattr(db_extraction, key, value)
        db.commit()
        db.refresh(db_extraction)
    return db_extraction
