from sqlalchemy import Column, Integer, String, Float, DateTime, Text, JSON
from datetime import datetime
from kyc_extractor.db.database import Base

class Extraction(Base):
    __tablename__ = "extractions"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    
    # Request metadata
    request_id = Column(String(36), unique=True, nullable=False, index=True)
    filename = Column(String(255), nullable=False)
    file_size_bytes = Column(Integer)
    uploaded_at = Column(DateTime, default=datetime.utcnow, index=True)
    
    # Extraction results
    document_type = Column(String(50), index=True)
    company_name = Column(String(255))
    trade_name = Column(String(255))
    identification_number = Column(String(50))
    
    # Address stored as JSON
    address_json = Column(JSON)
    
    issue_date = Column(String(20))  # Store as string (YYYY-MM-DD) for flexibility
    approver_name = Column(String(255))
    
    # Quality metrics
    confidence = Column(Float)
    confidence_reason = Column(Text)
    data_quality_score = Column(Integer)  # 0-100
    
    # Validation results stored as JSON
    validation_results = Column(JSON)
    
    # Processing metadata
    processing_time_ms = Column(Integer)
    api_version = Column(String(10), default="v0.2.0")
    
    def __repr__(self):
        return f"<Extraction(id={self.id}, request_id={self.request_id}, company={self.company_name})>"
