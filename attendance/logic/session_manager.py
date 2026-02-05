import sqlite3
from datetime import datetime


class SessionManager:
    def __init__(self, db_path="database/face_attendance.db"):
        self.db_path = db_path

    def process_events(self):
        conn = sqlite3.connect(self.db_path)
        c = conn.cursor()

        c.execute("""
            SELECT person_id, event, timestamp
            FROM attendance_events
            ORDER BY person_id, timestamp
        """)

        rows = c.fetchall()

        sessions = {}
        records = []

        for person_id, event, ts in rows:
            ts = datetime.fromisoformat(ts)

            if event == "IN":
                sessions[person_id] = ts

            elif event == "OUT" and person_id in sessions:
                in_time = sessions.pop(person_id)
                duration = (ts - in_time).total_seconds()

                records.append((person_id, in_time, ts, duration))

        for person_id, in_time, out_time, duration in records:
            c.execute("""
                INSERT INTO face_attendance
                (person_id, in_time, out_time, duration_seconds)
                VALUES (?, ?, ?, ?)
            """, (person_id, in_time, out_time, duration))

        conn.commit()
        conn.close()
