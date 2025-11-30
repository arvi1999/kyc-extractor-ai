"""
Auth Routes
"""
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from typing import List
from datetime import timedelta, datetime

from kyc_extractor.db.database import get_db
from kyc_extractor.db.models import User
from kyc_extractor.schemas import UserCreate, UserResponse, Token
from kyc_extractor.core.security import verify_password, get_password_hash, create_access_token, ACCESS_TOKEN_EXPIRE_MINUTES
from kyc_extractor.api.deps import get_current_admin_user, get_current_active_user

router = APIRouter()

@router.post("/auth/login", response_model=Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Your account is inactive. Please contact the administrator.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Update last_login timestamp
    user.last_login = datetime.utcnow()
    db.commit()
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/users", response_model=UserResponse)
def create_user(user: UserCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_admin_user)):
    """
    Create a new user (Admin only)
    """
    db_user = db.query(User).filter(User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = get_password_hash(user.password)
    new_user = User(
        email=user.email,
        hashed_password=hashed_password,
        full_name=user.full_name,
        role=user.role
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@router.get("/users", response_model=List[UserResponse])
def read_users(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user: User = Depends(get_current_admin_user)):
    """
    List all users (Admin only)
    """
    users = db.query(User).offset(skip).limit(limit).all()
    return users

@router.get("/users/me", response_model=UserResponse)
def read_current_user(current_user: User = Depends(get_current_active_user)):
    """
    Get current user details
    """
    return current_user

@router.get("/users/{user_id}", response_model=UserResponse)
def read_user(user_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_admin_user)):
    """
    Get user by ID (Admin only)
    """
    from kyc_extractor.db.crud import get_user_by_id
    user = get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.put("/users/{user_id}", response_model=UserResponse)
def update_user(
    user_id: int, 
    email: str = None,
    full_name: str = None, 
    role: str = None,
    is_active: bool = None,
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_admin_user)
):
    """
    Update user details (Admin only)
    """
    from kyc_extractor.db.crud import get_user_by_id, update_user as update_user_db, get_user_by_email
    
    user = get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Prevent self-modification of role
    if user_id == current_user.id and role and role != current_user.role:
        raise HTTPException(status_code=400, detail="Cannot change your own role")
    
    # Check if email is already taken
    if email and email != user.email:
        existing_user = get_user_by_email(db, email)
        if existing_user:
            raise HTTPException(status_code=400, detail="Email already registered")
    
    update_data = {}
    if email is not None:
        update_data['email'] = email
    if full_name is not None:
        update_data['full_name'] = full_name
    if role is not None and role in ['admin', 'user']:
        update_data['role'] = role
    if is_active is not None:
        update_data['is_active'] = is_active
    
    updated_user = update_user_db(db, user_id, update_data)
    return updated_user

@router.delete("/users/{user_id}")
def delete_user(user_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_admin_user)):
    """
    Deactivate user (Admin only) - Soft delete
    """
    from kyc_extractor.db.crud import get_user_by_id, deactivate_user
    
    # Prevent self-deletion
    if user_id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot deactivate yourself")
    
    user = get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    deactivate_user(db, user_id)
    return {"message": "User deactivated successfully"}

@router.put("/users/{user_id}/password")
def change_user_password(
    user_id: int,
    new_password: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """
    Change user password (Admin only)
    """
    from kyc_extractor.db.crud import get_user_by_id, update_user_password
    
    user = get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if len(new_password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters")
    
    hashed_password = get_password_hash(new_password)
    update_user_password(db, user_id, hashed_password)
    return {"detail": "Password changed successfully"}

@router.get("/auth/me", response_model=UserResponse)
async def get_current_user_details(current_user: User = Depends(get_current_active_user)):
    """
    Get current logged-in user details
    """
    return current_user
