from sqlalchemy import Column, Integer, String, Text, JSON, Float, DateTime, Boolean, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from kyc_extractor.db.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255))
    role = Column(String(20), default="user")  # 'admin' or 'user'
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    extractions = relationship("Extraction", back_populates="user")

class Extraction(Base):
    __tablename__ = "extractions"

    id = Column(Integer, primary_key=True, index=True)
    request_id = Column(String(36), unique=True, index=True, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True) # Nullable for backward compatibility
    
    filename = Column(String(255))
    file_size_bytes = Column(Integer)
    document_type = Column(String(50))
    
    # Extracted Data
    company_name = Column(String(255))
    trade_name = Column(String(255))
    identification_number = Column(String(50))
    address_json = Column(JSON)
    issue_date = Column(String(20))
    approver_name = Column(String(255))
    
    # Metadata & Scoring
    confidence = Column(Float)
    confidence_reason = Column(Text)
    data_quality_score = Column(Integer)
    validation_results = Column(JSON)
    
    processing_time_ms = Column(Integer)
    uploaded_at = Column(DateTime(timezone=True), server_default=func.now())
    
    user = relationship("User", back_populates="extractions")
    api_version = Column(String(10), default="v0.2.0")
    
    def __repr__(self):
        return f"<Extraction(id={self.id}, request_id={self.request_id}, company={self.company_name})>"
