from pydantic import BaseModel
from typing import Optional, Literal

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
