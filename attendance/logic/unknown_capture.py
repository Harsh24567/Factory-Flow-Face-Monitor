import cv2
import os
import datetime


class UnknownCaptureManager:
    """
    Handles snapshot capture for UNKNOWN persons.
    """

    def __init__(self, base_dir="data/raw_faces/unknown"):
        self.base_dir = base_dir
        os.makedirs(self.base_dir, exist_ok=True)

        # Track which UNKNOWN IDs are already captured
        self.captured_sessions = set()

    def capture_if_needed(self, person, frame):
        """
        person : PersonTracker
        frame  : current OpenCV frame
        """

        if not person.person_id.startswith("UNKNOWN"):
            return

        if not person.is_inside:
            return

        # Prevent duplicate captures for same UNKNOWN
        if person.person_id in self.captured_sessions:
            return

        date_str = datetime.date.today().isoformat()
        time_str = datetime.datetime.now().strftime("%H-%M-%S")

        day_dir = os.path.join(self.base_dir, date_str)
        os.makedirs(day_dir, exist_ok=True)

        filename = f"{person.person_id}_{time_str}.jpg"
        filepath = os.path.join(day_dir, filename)

        cv2.imwrite(filepath, frame)

        self.captured_sessions.add(person.person_id)

        print(f"[UNKNOWN SNAPSHOT] Saved {filepath}")
