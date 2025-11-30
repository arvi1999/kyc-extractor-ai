from pydantic import BaseModel
from typing import Optional, Literal, List
from datetime import datetime

class Address(BaseModel):
    full_address: Optional[str] = None
    address_line_1: Optional[str] = None
    locality: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    pincode: Optional[str] = None

class ExtractedData(BaseModel):
    company_name: Optional[str] = None
    trade_name: Optional[str] = None
    identification_number: Optional[str] = None
    address: Optional[Address] = None
    issue_date: Optional[str] = None
    approver_name: Optional[str] = None

class ExtractionResponse(BaseModel):
    request_id: str
    document_type: Literal[
        "GST_CERTIFICATE", 
        "PAN_CARD", 
        "FSSAI", 
        "INCORPORATION_CERT", 
        "MSME", 
        "SHOP_ESTABLISHMENT", 
        "OTHER"
    ]
    data: ExtractedData
    confidence: float
    confidence_reason: Optional[str] = None
    
    # New fields for v0.2.0
    validation_results: Optional[dict] = None
    data_quality_score: Optional[int] = None
    quality_grade: Optional[str] = None
    processing_time_ms: Optional[int] = None
    uploaded_at: Optional[datetime] = None

class HistoryResponse(BaseModel):
    total: int
    items: List[ExtractionResponse]

class BatchExtractionResponse(BaseModel):
    total_processed: int
    successful: int
    failed: int
    results: List[ExtractionResponse]
    errors: List[dict]

# Auth Schemas
class UserBase(BaseModel):
    email: str # Simplified from EmailStr to avoid extra dependency for now, or use EmailStr if pydantic[email] is installed
    full_name: Optional[str] = None

class UserCreate(UserBase):
    password: str
    role: str = "user" # 'admin' or 'user'

class UserResponse(BaseModel):
    id: int
    email: str
    full_name: Optional[str] = None
    role: str
    is_active: bool
    created_at: datetime
    last_login: Optional[datetime] = None
    
    class Config:
        from_attributes = True # Pydantic v2 uses from_attributes instead of orm_mode

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

