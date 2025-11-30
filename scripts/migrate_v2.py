"""
Migration script to add user_id column to extractions table.
"""
import sys
import os
from sqlalchemy import text

# Add project root to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from kyc_extractor.db.database import engine

def migrate_v2():
    print("🔄 Running migration v2: Adding user_id to extractions table...")
    with engine.connect() as connection:
        try:
            # Check if column exists
            result = connection.execute(text("SHOW COLUMNS FROM extractions LIKE 'user_id'"))
            if result.fetchone():
                print("⚠️ Column 'user_id' already exists. Skipping.")
                return

            # Add column
            print("➕ Adding 'user_id' column...")
            connection.execute(text("ALTER TABLE extractions ADD COLUMN user_id INT"))
            connection.execute(text("ALTER TABLE extractions ADD CONSTRAINT fk_user_id FOREIGN KEY (user_id) REFERENCES users(id)"))
            connection.commit()
            print("✅ Migration successful!")
            
        except Exception as e:
            print(f"❌ Migration failed: {e}")

if __name__ == "__main__":
    migrate_v2()
