import sqlite3
from datetime import datetime
from config.attendance_config import DRY_RUN

class AttendanceWriter:
    def __init__(self, db_path="database/face_attendance.db"):
        self.db_path = db_path

    def _execute(self, query, params):
        if DRY_RUN:
            print("[DRY_RUN]", query, params)
            return

        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        cursor.execute(query, params)
        conn.commit()
        conn.close()

    def mark_in(self, person):
        self._execute(
            "INSERT INTO attendance_events (person_id, event, timestamp) VALUES (?, ?, ?)",
            (person.person_id, "IN", datetime.now().isoformat())
        )

    def mark_out(self, person):
        self._execute(
            "INSERT INTO attendance_events (person_id, event, timestamp) VALUES (?, ?, ?)",
            (person.person_id, "OUT", datetime.now().isoformat())
        )
