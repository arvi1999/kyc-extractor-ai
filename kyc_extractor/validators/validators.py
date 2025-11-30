"""
Validators for Indian business identifiers and data fields
"""
import re
from typing import Dict, Optional

class IDValidator:
    """Validates various Indian business identification numbers"""
    
    # Regex patterns
    GSTIN_PATTERN = r'^\d{2}[A-Z]{5}\d{4}[A-Z]{1}\d[Z]{1}[A-Z\d]{1}$'
    PAN_PATTERN = r'^[A-Z]{5}\d{4}[A-Z]{1}$'
    CIN_PATTERN = r'^[UL]\d{5}[A-Z]{2}\d{4}[A-Z]{3}\d{6}$'
    PINCODE_PATTERN = r'^\d{6}$'
    
    @staticmethod
    def validate_gstin(gstin: Optional[str]) -> Dict[str, any]:
        """Validate GSTIN (Goods and Services Tax Identification Number)"""
        if not gstin:
            return {"valid": False, "reason": "GSTIN is empty"}
        
        gstin = gstin.strip().upper()
        if re.match(IDValidator.GSTIN_PATTERN, gstin):
            return {"valid": True, "format": "valid", "value": gstin}
        else:
            return {"valid": False, "reason": "Invalid GSTIN format", "value": gstin}
    
    @staticmethod
    def validate_pan(pan: Optional[str]) -> Dict[str, any]:
        """Validate PAN (Permanent Account Number)"""
        if not pan:
            return {"valid": False, "reason": "PAN is empty"}
        
        pan = pan.strip().upper()
        if re.match(IDValidator.PAN_PATTERN, pan):
            return {"valid": True, "format": "valid", "value": pan}
        else:
            return {"valid": False, "reason": "Invalid PAN format", "value": pan}
    
    @staticmethod
    def validate_cin(cin: Optional[str]) -> Dict[str, any]:
        """Validate CIN (Corporate Identification Number)"""
        if not cin:
            return {"valid": False, "reason": "CIN is empty"}
        
        cin = cin.strip().upper()
        if re.match(IDValidator.CIN_PATTERN, cin):
            return {"valid": True, "format": "valid", "value": cin}
        else:
            return {"valid": False, "reason": "Invalid CIN format", "value": cin}
    
    @staticmethod
    def validate_pincode(pincode: Optional[str]) -> Dict[str, any]:
        """Validate Indian Pincode"""
        if not pincode:
            return {"valid": False, "reason": "Pincode is empty"}
        
        pincode = str(pincode).strip()
        if re.match(IDValidator.PINCODE_PATTERN, pincode):
            return {"valid": True, "format": "valid", "value": pincode}
        else:
            return {"valid": False, "reason": "Invalid pincode format", "value": pincode}

def validate_extraction(document_type: str, identification_number: Optional[str], 
                       pincode: Optional[str]) -> Dict[str, any]:
    """
    Validate extracted data based on document type
    Returns a dict with validation results for each field
    """
    results = {}
    
    # Validate identification number based on document type
    if identification_number:
        if document_type == "GST_CERTIFICATE":
            results["identification_number"] = IDValidator.validate_gstin(identification_number)
        elif document_type == "PAN_CARD":
            results["identification_number"] = IDValidator.validate_pan(identification_number)
        elif document_type == "INCORPORATION_CERT":
            results["identification_number"] = IDValidator.validate_cin(identification_number)
        else:
            # For other document types, mark as valid (no specific format)
            results["identification_number"] = {"valid": True, "format": "unknown", "value": identification_number}
    else:
        results["identification_number"] = {"valid": False, "reason": "ID number not extracted"}
    
    # Validate pincode
    if pincode:
        results["pincode"] = IDValidator.validate_pincode(pincode)
    else:
        results["pincode"] = {"valid": None, "reason": "Pincode not extracted"}
    
    return results
