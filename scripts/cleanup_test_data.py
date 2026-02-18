
import sys
import os
from pathlib import Path

# Add project root to python path
sys.path.append(os.getcwd())

from database.models import SessionLocal, FaceAttendance

def cleanup():
    db = SessionLocal()
    try:
        test_ids = ["TEST_EARLY", "TEST_ONTIME", "TEST_LATE"]
        print(f"Deleting records for IDs: {test_ids}")
        
        # Delete records
        result = db.query(FaceAttendance).filter(FaceAttendance.person_id.in_(test_ids)).delete(synchronize_session=False)
        db.commit()
        
        print(f"Successfully deleted {result} records.")
        
    except Exception as e:
        print(f"Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    cleanup()
