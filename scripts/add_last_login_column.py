#!/usr/bin/env python3
"""
Manual migration to add last_login column to users table
"""
from kyc_extractor.db.database import engine

print("Adding last_login column to users table...")

with engine.connect() as conn:
    try:
        conn.execute("ALTER TABLE users ADD COLUMN last_login DATETIME DEFAULT NULL AFTER created_at")
        conn.commit()
        print("✓ Successfully added last_login column")
    except Exception as e:
        if "Duplicate column name" in str(e):
            print("! Column last_login already exists, skipping")
        else:
            print(f"✗ Error: {e}")
            raise

print("\n✓ Migration complete!")
