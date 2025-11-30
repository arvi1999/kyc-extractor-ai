"""
Script to create the first admin user.
Usage: python scripts/create_admin.py <email> <password> <full_name>
"""
import sys
import os
from passlib.context import CryptContext
from sqlalchemy.orm import Session

# Add project root to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from kyc_extractor.db.database import SessionLocal, engine, Base
from kyc_extractor.db.models import User

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password):
    return pwd_context.hash(password)

def create_admin(email, password, full_name):
    db = SessionLocal()
    try:
        # Check if user exists
        existing_user = db.query(User).filter(User.email == email).first()
        if existing_user:
            print(f"❌ User with email {email} already exists.")
            return

        # Create new admin user
        hashed_password = get_password_hash(password)
        new_user = User(
            email=email,
            hashed_password=hashed_password,
            full_name=full_name,
            role="admin",
            is_active=True
        )
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        print(f"✅ Admin user created successfully: {email} (ID: {new_user.id})")
        
    except Exception as e:
        print(f"❌ Error creating admin: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    if len(sys.argv) != 4:
        print("Usage: python scripts/create_admin.py <email> <password> <full_name>")
        sys.exit(1)
        
    email = sys.argv[1]
    password = sys.argv[2]
    full_name = sys.argv[3]
    
    # Ensure tables exist
    print("🔧 Ensuring database tables exist...")
    Base.metadata.create_all(bind=engine)
    
    create_admin(email, password, full_name)
