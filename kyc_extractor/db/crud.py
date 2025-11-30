from sqlalchemy.orm import Session
from sqlalchemy import func, case, desc
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

def get_extraction_by_request_id(db: Session, request_id: str, user_id: int = None, role: str = "user") -> Optional[Extraction]:
    """Get extraction by request_id with RBAC"""
    query = db.query(Extraction).filter(Extraction.request_id == request_id)
    if role != "admin" and user_id:
        query = query.filter(Extraction.user_id == user_id)
    return query.first()

def get_extractions_history(
    db: Session,
    skip: int = 0,
    limit: int = 10,
    document_type: Optional[str] = None,
    days_ago: Optional[int] = None,
    user_id: Optional[int] = None,
    role: str = "user"
) -> List[Extraction]:
    """Get extraction history with filters and RBAC"""
    query = db.query(Extraction)

    # RBAC: If not admin, filter by user_id
    if role != "admin" and user_id:
        query = query.filter(Extraction.user_id == user_id)

    # Filter by document type if specified
    if document_type:
        query = query.filter(Extraction.document_type == document_type)

    # Filter by date range if specified
    if days_ago:
        cutoff_date = datetime.utcnow() - timedelta(days=days_ago)
        query = query.filter(Extraction.uploaded_at >= cutoff_date)

    # Order by most recent first
    query = query.order_by(Extraction.uploaded_at.desc())

    return query.offset(skip).limit(limit).all()

def update_extraction(db: Session, request_id: str, update_data: dict) -> Optional[Extraction]:
    """Update an extraction record"""
    extraction = get_extraction_by_request_id(db, request_id)
    if not extraction:
        return None
    
    for key, value in update_data.items():
        setattr(extraction, key, value)
    
    db.commit()
    db.refresh(extraction)
    return extraction

# ============== User Management CRUD ==============

def get_user_by_id(db: Session, user_id: int):
    """Get user by ID"""
    from kyc_extractor.db.models import User
    return db.query(User).filter(User.id == user_id).first()

def get_user_by_email(db: Session, email: str):
    """Get user by email"""
    from kyc_extractor.db.models import User
    return db.query(User).filter(User.email == email).first()

def get_all_users(db: Session, skip: int = 0, limit: int = 100):
    """Get all users with pagination"""
    from kyc_extractor.db.models import User
    return db.query(User).offset(skip).limit(limit).all()

def update_user(db: Session, user_id: int, update_data: dict):
    """Update user details"""
    user = get_user_by_id(db, user_id)
    if not user:
        return None
    
    for key, value in update_data.items():
        if hasattr(user, key):
            setattr(user, key, value)
    
    db.commit()
    db.refresh(user)
    return user

def deactivate_user(db: Session, user_id: int):
    """Soft delete user by setting is_active to False"""
    user = get_user_by_id(db, user_id)
    if not user:
        return None
    
    user.is_active = False
    db.commit()
    db.refresh(user)
    return user

def activate_user(db: Session, user_id: int):
    """Activate user by setting is_active to True"""
    user = get_user_by_id(db, user_id)
    if not user:
        return None
    
    user.is_active = True
    db.commit()
    db.refresh(user)
    return user

def update_user_password(db: Session, user_id: int, hashed_password: str):
    """Update user password"""
    user = get_user_by_id(db, user_id)
    if not user:
        return None
    
    user.hashed_password = hashed_password
    db.commit()
    db.refresh(user)
    return user

def get_dashboard_stats(db: Session, user_id: int = None, role: str = "user"):
    """
    Calculate dashboard statistics:
    - Summary cards (Total, Success Rate, Avg Confidence, Pending)
    - Daily volume trend (Last 7 days)
    - Quality distribution
    """
    from kyc_extractor.db.models import Extraction, User
    
    # Base query
    query = db.query(Extraction)
    if role != "admin" and user_id:
        query = query.filter(Extraction.user_id == user_id)
    
    # Define quality grade expression (aligned with scoring.py)
    quality_grade_expr = case(
        (Extraction.data_quality_score >= 90, 'A'),
        (Extraction.data_quality_score >= 75, 'B'),
        (Extraction.data_quality_score >= 60, 'C'),
        (Extraction.data_quality_score >= 40, 'D'),
        else_='F'
    )
    
    # 1. Summary Metrics
    total_count = query.count()
    
    # Success Rate (Grade A or B -> Score >= 75)
    success_count = query.filter(Extraction.data_quality_score >= 75).count()
    success_rate = (success_count / total_count * 100) if total_count > 0 else 0
    
    # Avg Confidence
    avg_confidence = query.with_entities(func.avg(Extraction.confidence)).scalar() or 0.0
    
    # Pending Reviews (Grade C, D, or F -> Score < 75)
    pending_count = query.filter(Extraction.data_quality_score < 75).count()
    
    # Today's Volume & Trend
    today = datetime.utcnow().date()
    yesterday = today - timedelta(days=1)
    
    today_count = query.filter(func.date(Extraction.uploaded_at) == today).count()
    yesterday_count = query.filter(func.date(Extraction.uploaded_at) == yesterday).count()
    
    volume_trend = 0
    if yesterday_count > 0:
        volume_trend = ((today_count - yesterday_count) / yesterday_count) * 100
    elif today_count > 0:
        volume_trend = 100 # 100% increase if yesterday was 0
        
    # Active Users (Admin only)
    active_users_count = 0
    if role == "admin":
        active_users_count = db.query(User).filter(User.is_active == True).count()
        
    # 2. Charts Data
    
    # Daily Trend (Last 7 days)
    seven_days_ago = today - timedelta(days=6)
    daily_stats = query.with_entities(
        func.date(Extraction.uploaded_at).label('date'),
        func.count(Extraction.id).label('count')
    ).filter(
        func.date(Extraction.uploaded_at) >= seven_days_ago
    ).group_by(
        func.date(Extraction.uploaded_at)
    ).all()
    
    # Fill missing days
    daily_trend = []
    stats_map = {str(s.date): s.count for s in daily_stats}
    
    for i in range(7):
        d = seven_days_ago + timedelta(days=i)
        d_str = str(d)
        daily_trend.append({
            "date": d.strftime("%b %d"), # e.g. "Nov 30"
            "count": stats_map.get(d_str, 0)
        })
        
    # Quality Distribution
    quality_stats = query.with_entities(
        quality_grade_expr.label('grade'),
        func.count(Extraction.id)
    ).group_by(
        quality_grade_expr
    ).all()
    
    quality_distribution = [
        {"name": f"Grade {s[0]}", "value": s[1]} for s in quality_stats if s[0]
    ]
    
    # 3. Recent Activity (Last 5)
    recent_activity = query.order_by(desc(Extraction.uploaded_at)).limit(5).all()
    
    return {
        "summary": {
            "total_documents": total_count,
            "success_rate": round(success_rate, 1),
            "avg_confidence": round(avg_confidence * 100, 1), # Convert to percentage
            "pending_reviews": pending_count,
            "todays_volume": today_count,
            "volume_trend": round(volume_trend, 1),
            "active_users": active_users_count
        },
        "charts": {
            "daily_trend": daily_trend,
            "quality_distribution": quality_distribution
        },
        "recent_activity": recent_activity
    }

def get_avg_processing_time(db: Session, user_id: int = None, role: str = "user", limit: int = 7):
    """
    Get average processing time from recent successful extractions
    Returns time in milliseconds
    """
    from kyc_extractor.db.models import Extraction
    
    query = db.query(Extraction).filter(
        Extraction.processing_time_ms.isnot(None),
        Extraction.processing_time_ms > 0
    )
    
    # Filter by user if not admin
    if role != "admin" and user_id:
        query = query.filter(Extraction.user_id == user_id)
    
    # Get last N extractions
    recent = query.order_by(desc(Extraction.uploaded_at)).limit(limit).all()
    
    if not recent:
        return 3000  # Default 3 seconds
    
    avg_time = sum(e.processing_time_ms for e in recent) / len(recent)
    return int(avg_time)
