import sys
import os
from datetime import datetime, timedelta
import requests

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database.models import init_db, SessionLocal, SystemSettings, FaceAttendance, Base, engine

# Init DB
init_db()

def setup_test_data():
    db = SessionLocal()
    
    # 1. Set Settings: 9:00 AM - 5:00 PM
    s1 = db.query(SystemSettings).filter_by(key="work_start_time").first()
    if not s1: s1 = SystemSettings(key="work_start_time", value="09:00")
    s1.value = "09:00"
    db.add(s1)
    
    s2 = db.query(SystemSettings).filter_by(key="work_end_time").first()
    if not s2: s2 = SystemSettings(key="work_end_time", value="17:00")
    s2.value = "17:00"
    db.add(s2)
    
    # 2. Clear previous entries for test workers (optional, or just use new IDs)
    today = datetime.now().date()
    
    # Worker A: ON TIME (8:55 - 17:05)
    w_ontime = FaceAttendance(
        person_id="TEST_ONTIME",
        date=today,
        in_time=datetime.now().replace(hour=8, minute=55),
        out_time=datetime.now().replace(hour=17, minute=5),
        duration_seconds=8*3600
    )
    
    # Worker B: LATE (9:15 - 17:05)
    w_late = FaceAttendance(
        person_id="TEST_LATE",
        date=today,
        in_time=datetime.now().replace(hour=9, minute=15),
        out_time=datetime.now().replace(hour=17, minute=5),
        duration_seconds=7*3600
    )
    
    # Worker C: EARLY LEFT (8:55 - 16:30)
    w_early = FaceAttendance(
        person_id="TEST_EARLY",
        date=today,
        in_time=datetime.now().replace(hour=8, minute=55),
        out_time=datetime.now().replace(hour=16, minute=30),
        duration_seconds=7*3600
    )
    
    db.add(w_ontime)
    db.add(w_late)
    db.add(w_early)
    db.commit()
    db.close()
    print("Test data injected.")

def verify_logic():
    # We can use AttendanceDataReader directly instead of running API server
    from api.data_reader import AttendanceDataReader
    reader = AttendanceDataReader()
    
    today_str = datetime.now().strftime("%Y-%m-%d")
    
    print("\n--- Verifying Logic ---")
    
    # Check ON TIME
    stats = reader.get_worker_stats("TEST_ONTIME", today_str)
    print(f"TEST_ONTIME: Late={stats['is_late']}, Early={stats['left_early']} (Expected: False, False)")
    
    # Check LATE
    stats = reader.get_worker_stats("TEST_LATE", today_str)
    print(f"TEST_LATE:   Late={stats['is_late']}, Early={stats['left_early']} (Expected: True, False)")
    
    # Check EARLY
    stats = reader.get_worker_stats("TEST_EARLY", today_str)
    print(f"TEST_EARLY:  Late={stats['is_late']}, Early={stats['left_early']} (Expected: False, True)")

if __name__ == "__main__":
    try:
        setup_test_data()
        verify_logic()
    except Exception as e:
        print(f"Error: {e}")
