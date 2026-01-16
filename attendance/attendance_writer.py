# attendance/logic/attendance_writer.py

from database.models import SessionLocal, FaceAttendance
import datetime
import logging

logger = logging.getLogger(__name__)

class AttendanceWriter:
    def __init__(self, dry_run=True):
        self.dry_run = dry_run

    def write(self, person_id, in_time, out_time, confidence=None):
        duration = (out_time - in_time).total_seconds()

        if self.dry_run:
            logger.info(
                f"[DRY RUN] DB WRITE SKIPPED | {person_id} | "
                f"Duration: {duration:.2f}s"
            )
            return

        db = SessionLocal()
        try:
            record = FaceAttendance(
                person_id=person_id,
                in_time=in_time,
                out_time=out_time,
                duration_seconds=duration,
                confidence=confidence
            )
            db.add(record)
            db.commit()
            logger.info(f"[DB] Attendance saved for {person_id}")
        except Exception as e:
            db.rollback()
            logger.error(f"DB write failed: {e}")
        finally:
            db.close()
