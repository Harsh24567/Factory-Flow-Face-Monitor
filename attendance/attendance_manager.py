import time
import logging
from config import UNKNOWN_LABEL, PRESENCE_GRACE_SECONDS, MIN_SEEN_SECONDS

logger = logging.getLogger(__name__)

class AttendanceManager:
    def __init__(self):
        self.active_person = None
        self.in_time = None
        self.last_seen = None
        self.present = False

    def update(self, label: str, face_detected: bool):
        now = time.time()

        if face_detected:
            self.last_seen = now

            if not self.present:
                if self.in_time is None:
                    self.in_time = now
                    logger.info(f"[SEEN] {label} first detected")
                elif now - self.in_time >= MIN_SEEN_SECONDS:
                    self.present = True
                    self.active_person = label
                    logger.info(f"{label} -> IN")
            return

        if self.present and self.last_seen:
            if now - self.last_seen >= PRESENCE_GRACE_SECONDS:
                logger.info(f"{self.active_person} -> OUT")
                self._reset()

        if not face_detected and not self.present:
            self.in_time = None

    def _reset(self):
        self.active_person = None
        self.in_time = None
        self.last_seen = None
        self.present = False
