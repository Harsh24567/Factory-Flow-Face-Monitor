import csv
import os
from datetime import datetime

class CSVAttendanceWriter:
    def __init__(self, file_path="attendance_log.csv"):
        self.file_path = file_path
        self._ensure_file_exists()

    def _ensure_file_exists(self):
        """Create file with header if it doesn't exist."""
        if not os.path.exists(self.file_path):
            with open(self.file_path, mode='w', newline='') as file:
                writer = csv.writer(file)
                writer.writerow(["Person ID", "Date", "In Time", "Out Time", "Duration (sec)"])

    def log_record(self, person_id, in_time, out_time, duration):
        """Append a record to the CSV file and Database."""
        date_str = in_time.strftime("%Y-%m-%d")
        in_str = in_time.strftime("%H:%M:%S")
        out_str = out_time.strftime("%H:%M:%S")

        # 1. Write to CSV
        try:
            with open(self.file_path, mode='a', newline='') as file:
                writer = csv.writer(file)
                writer.writerow([person_id, date_str, in_str, out_str, f"{duration:.2f}"])
        except Exception as e:
            print(f"Error writing to CSV: {e}")

        # 2. Write to Database
        try:
            from database.models import SessionLocal, FaceAttendance
            db = SessionLocal()
            db_record = FaceAttendance(
                person_id=person_id,
                date=in_time.date(),
                in_time=in_time,
                out_time=out_time,
                duration_seconds=duration,
                confidence=100.0 # Default confidence for tracked session
            )
            db.add(db_record)
            db.commit()
            db.close()
            print(f"[LOGGED] Saved record for {person_id} to DB & CSV (Duration: {duration:.2f}s)")
        except Exception as e:
            print(f"Error writing to Database: {e}")

    def log_entry(self, person_id, in_time):
        """Log just the entry time to DB (Immediate Check-In)."""
        try:
            from database.models import SessionLocal, FaceAttendance
            db = SessionLocal()
            
            # Check if there is already an open session for this person today (out_time is None)
            existing = db.query(FaceAttendance).filter(
                FaceAttendance.person_id == person_id,
                FaceAttendance.out_time == None,
                FaceAttendance.date == in_time.date()
            ).first()

            if existing:
                print(f"[INFO] Open session already exists for {person_id}. Skipping duplicate entry.")
                db.close()
                return

            db_record = FaceAttendance(
                person_id=person_id,
                date=in_time.date(),
                in_time=in_time,
                out_time=None,
                duration_seconds=0,
                confidence=100.0
            )
            db.add(db_record)
            db.commit()
            db.close()
            print(f"✅ [CHECK-IN] {person_id} at {in_time.strftime('%H:%M:%S')}")
        except Exception as e:
            print(f"Error logging entry: {e}")

    def update_exit(self, person_id, out_time):
        """Update the existing open session with out_time and duration."""
        try:
            from database.models import SessionLocal, FaceAttendance
            db = SessionLocal()
            
            # Find the latest open session
            record = db.query(FaceAttendance).filter(
                FaceAttendance.person_id == person_id,
                FaceAttendance.out_time == None
            ).order_by(FaceAttendance.in_time.desc()).first()

            if record:
                duration = (out_time - record.in_time).total_seconds()
                record.out_time = out_time
                record.duration_seconds = duration
                db.commit()
                print(f"❌ [CHECK-OUT] {person_id} at {out_time.strftime('%H:%M:%S')} (Duration: {duration:.1f}s)")
                
                # Also append to CSV for backup (full record)
                self.log_record_csv_only(person_id, record.in_time, out_time, duration)
            else:
                print(f"[WARN] No open session found for {person_id} to close.")
            
            db.close()
        except Exception as e:
            print(f"Error updating exit: {e}")

    def log_record_csv_only(self, person_id, in_time, out_time, duration):
        """Helper to write to CSV only (used by update_exit)."""
        date_str = in_time.strftime("%Y-%m-%d")
        in_str = in_time.strftime("%H:%M:%S")
        out_str = out_time.strftime("%H:%M:%S")
        try:
            with open(self.file_path, mode='a', newline='') as file:
                writer = csv.writer(file)
                writer.writerow([person_id, date_str, in_str, out_str, f"{duration:.2f}"])
        except Exception as e:
            print(f"Error writing to CSV: {e}")

