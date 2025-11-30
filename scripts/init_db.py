#!/usr/bin/env python3
"""
Database initialization script for KYC Extractor
Creates the MySQL database and tables
"""

import sys
import os

# Add project root to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from kyc_extractor.db.database import engine, Base
from kyc_extractor.db.models import Extraction
import pymysql
from kyc_extractor.core.config import settings

def create_database():
    """Create the database if it doesn't exist"""
    try:
        # Connect to MySQL server (without specifying database)
        connection = pymysql.connect(
            host=settings.MYSQL_HOST,
            user=settings.MYSQL_USER,
            password=settings.MYSQL_PASSWORD,
            port=settings.MYSQL_PORT
        )
        
        cursor = connection.cursor()
        cursor.execute(f"CREATE DATABASE IF NOT EXISTS {settings.MYSQL_DATABASE}")
        print(f"✅ Database '{settings.MYSQL_DATABASE}' created/verified")
        
        cursor.close()
        connection.close()
        
    except Exception as e:
        print(f"❌ Error creating database: {e}")
        sys.exit(1)

def create_tables():
    """Create all tables"""
    try:
        Base.metadata.create_all(bind=engine)
        print("✅ All tables created successfully")
    except Exception as e:
        print(f"❌ Error creating tables: {e}")
        sys.exit(1)

if __name__ == "__main__":
    print("🔧 Initializing KYC Extractor Database...")
    print(f"📍 Host: {settings.MYSQL_HOST}")
    print(f"📍 Database: {settings.MYSQL_DATABASE}")
    
    create_database()
    create_tables()
    
    print("\n✨ Database initialization complete!")
