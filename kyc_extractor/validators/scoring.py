"""
Data quality scoring for extracted information
"""
from typing import Dict, Optional

def calculate_data_quality_score(
    extracted_data: Dict,
    validation_results: Dict,
    confidence: float
) -> int:
    """
    Calculate a data quality score (0-100) based on:
    1. Field completeness (how many required fields are populated)
    2. Format validity (regex match for IDs)
    3. LLM confidence score
    
    Args:
        extracted_data: The extracted data dictionary
        validation_results: Validation results from validators.py
        confidence: Confidence score from LLM (0.0-1.0)
    
    Returns:
        int: Data quality score (0-100)
    """
    scores = []
    
    # 1. Field Completeness Score (40 points max)
    required_fields = [
        'company_name',
        'identification_number',
        'address',
        'document_type'
    ]
    
    populated_fields = 0
    for field in required_fields:
        value = extracted_data.get(field)
        if value and value != "null" and str(value).strip():
            # For address, check if it's a dict with at least full_address
            if field == 'address' and isinstance(value, dict):
                if value.get('full_address'):
                    populated_fields += 1
            elif field != 'address':
                populated_fields += 1
    
    completeness_score = (populated_fields / len(required_fields)) * 40
    scores.append(completeness_score)
    
    # 2. Validation Score (30 points max)
    validation_score = 0
    if validation_results:
        id_validation = validation_results.get('identification_number', {})
        if id_validation.get('valid'):
            validation_score += 20  # ID validation is critical
        
        pincode_validation = validation_results.get('pincode', {})
        if pincode_validation.get('valid'):
            validation_score += 10
    
    scores.append(validation_score)
    
    # 3. Confidence Score (30 points max)
    # Convert 0.0-1.0 to 0-30
    confidence_score = confidence * 30
    scores.append(confidence_score)
    
    # Final score
    total_score = sum(scores)
    
    # Ensure it's between 0-100
    return int(min(100, max(0, total_score)))

def get_quality_grade(score: int) -> str:
    """
    Get a letter grade based on quality score
    """
    if score >= 90:
        return "A"
    elif score >= 75:
        return "B"
    elif score >= 60:
        return "C"
    elif score >= 40:
        return "D"
    else:
        return "F"
