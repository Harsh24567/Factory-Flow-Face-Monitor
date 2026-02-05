import time
import datetime
from config.attendance_config import ENTRY_THRESHOLD_SEC, EXIT_THRESHOLD_SEC

class StateManager:
    def process(self, person, attendance_writer):
        now = time.time()

        # ENTRY
        if not person.is_inside:
            if person.seen_duration >= ENTRY_THRESHOLD_SEC:
                person.is_inside = True
                person.in_time = datetime.datetime.now()

        # EXIT
        else:
            absence_time = now - person.last_seen
            if absence_time >= EXIT_THRESHOLD_SEC:
                person.is_inside = False
                person.out_time = datetime.datetime.now()

                if person.person_id.startswith("UNKNOWN"):
                    return

                attendance_writer.mark_out(person)
