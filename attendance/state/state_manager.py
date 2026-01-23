# import time
# from config.attendance_config import (
#     ENTRY_THRESHOLD_SEC,
#     EXIT_THRESHOLD_SEC,
# )


# class StateManager:
#     """
#     Decides when a person is considered IN or OUT
#     based on visibility timing.
#     """

#     def process(self, person, attendance_writer):
#         """
#         person              : PersonTracker instance
#         attendance_writer   : AttendanceWriter instance
#         """

#         now = time.time()

#         if not person.is_inside:
#             if person.visible_duration >= ENTRY_THRESHOLD_SEC:
#                 person.is_inside = True
#                 person.in_time = now

#                 attendance_writer.mark_in(person)

#                 # Optional: reset visible duration after entry
#                 # person.reset_visibility_timer()
#         else:
#             absence_time = now - person.last_seen

#             if absence_time >= EXIT_THRESHOLD_SEC:
#                 person.is_inside = False
#                 person.out_time = now

#                 attendance_writer.mark_out(person)

import time
import datetime
from config.attendance_config import (
    ENTRY_THRESHOLD_SEC,
    EXIT_THRESHOLD_SEC,
)


class StateManager:
    """
    Controls IN / OUT transitions.
    Writes attendance ONLY on EXIT.
    """

    def process(self, person, attendance_writer):
        now = time.time()

        # -----------------------------
        # ENTRY
        # -----------------------------
        if not person.is_inside:
            if person.visible_duration >= ENTRY_THRESHOLD_SEC:
                person.is_inside = True
                person.in_time = datetime.datetime.now()

        # -----------------------------
        # EXIT
        # -----------------------------
        else:
            absence_time = now - person.last_seen

            if absence_time >= EXIT_THRESHOLD_SEC:
                person.is_inside = False
                person.out_time = datetime.datetime.now()

                # ❌ Skip UNKNOWN if required
                if person.person_id.startswith("UNKNOWN"):
                    return

                attendance_writer.write(
                    person_id=person.person_id,
                    in_time=person.in_time,
                    out_time=person.out_time,
                    confidence=getattr(person, "confidence", None)
                )
