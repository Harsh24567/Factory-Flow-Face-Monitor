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
        """Append a record to the CSV file."""
        date_str = in_time.strftime("%Y-%m-%d")
        in_str = in_time.strftime("%H:%M:%S")
        out_str = out_time.strftime("%H:%M:%S")

        with open(self.file_path, mode='a', newline='') as file:
            writer = csv.writer(file)
            writer.writerow([person_id, date_str, in_str, out_str, f"{duration:.2f}"])
        
        print(f"[LOGGED] Saved record for {person_id} (Duration: {duration:.2f}s)")
