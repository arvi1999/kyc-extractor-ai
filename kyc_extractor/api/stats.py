from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from pydantic import BaseModel

from kyc_extractor.db.database import get_db
from kyc_extractor.db.models import User
from kyc_extractor.api.deps import get_current_active_user
from kyc_extractor.db.crud import get_dashboard_stats
from kyc_extractor.schemas import ExtractionResponse

router = APIRouter()

class DashboardSummary(BaseModel):
    total_documents: int
    success_rate: float
    avg_confidence: float
    pending_reviews: int
    todays_volume: int
    volume_trend: float
    active_users: int

class ChartDataPoint(BaseModel):
    date: str
    count: int

class QualityDataPoint(BaseModel):
    name: str
    value: int

class DashboardCharts(BaseModel):
    daily_trend: List[ChartDataPoint]
    quality_distribution: List[QualityDataPoint]

class DashboardStatsResponse(BaseModel):
    summary: DashboardSummary
    charts: DashboardCharts
    recent_activity: List[ExtractionResponse]

@router.get("/dashboard", response_model=DashboardStatsResponse)
def get_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Get aggregated dashboard statistics
    """
    stats = get_dashboard_stats(db, user_id=current_user.id, role=current_user.role)
    
    # Transform recent_activity to match ExtractionResponse schema
    from kyc_extractor.validators import get_quality_grade
    
    transformed_activity = []
    for ext in stats['recent_activity']:
        transformed_activity.append(ExtractionResponse(
            request_id=ext.request_id,
            document_type=ext.document_type or "OTHER",
            data={
                "company_name": ext.company_name,
                "trade_name": ext.trade_name,
                "identification_number": ext.identification_number,
                "address": ext.address_json,
                "issue_date": ext.issue_date,
                "approver_name": ext.approver_name
            },
            confidence=ext.confidence or 0.0,
            confidence_reason=ext.confidence_reason,
            validation_results=ext.validation_results,
            data_quality_score=ext.data_quality_score,
            quality_grade=get_quality_grade(ext.data_quality_score or 0),
            processing_time_ms=ext.processing_time_ms,
            uploaded_at=ext.uploaded_at
        ))
    
    stats['recent_activity'] = transformed_activity
    return stats

@router.get("/avg-processing-time")
def get_avg_processing_time_endpoint(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Get average processing time from recent extractions
    Used for progress bar time estimation
    """
    from kyc_extractor.db.crud import get_avg_processing_time
    
    avg_time = get_avg_processing_time(
        db,
        user_id=current_user.id,
        role=current_user.role
    )
    
    return {
        "avg_time_ms": avg_time,
        "estimated_seconds": round(avg_time / 1000, 1)
    }
