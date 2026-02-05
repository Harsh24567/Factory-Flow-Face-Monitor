# import time
# from attendance.logic.attendance_writer import AttendanceWriter


# class AttendanceState:
#     def __init__(self):
#         self.is_inside = False
#         self.in_time = None
#         self.last_seen = None


# class AttendanceStateManager:
#     def __init__(self, entry_threshold=10, exit_threshold=60, db_path="database/attendance.db"):
#         self.entry_threshold = entry_threshold
#         self.exit_threshold = exit_threshold
#         self.states = {}  # person_id -> AttendanceState
#         self.writer = AttendanceWriter(db_path)

#     def update(self, tracked_people):
#         now = time.time()

#         for person_id, person in tracked_people.items():

#             if person_id.startswith("UNKNOWN"):
#                 continue  # Unknowns not stored in attendance

#             if person_id not in self.states:
#                 self.states[person_id] = AttendanceState()

#             state = self.states[person_id]
#             state.last_seen = person.last_seen

#             # ENTRY LOGIC
#             if not state.is_inside:
#                 if person.seen_duration >= self.entry_threshold:
#                     state.is_inside = True
#                     state.in_time = time.time()
#                     self.writer.mark_in(person)
#                     print(f"[ATTENDANCE] {person_id} marked IN")

#         self._check_exits(now)

#     def _check_exits(self, now):
#         for person_id, state in self.states.items():
#             if not state.is_inside:
#                 continue

#             if now - state.last_seen > self.exit_threshold:
#                 state.is_inside = False
#                 self.writer.mark_out_by_id(person_id)
#                 print(f"[ATTENDANCE] {person_id} marked OUT")
import time
from attendance.logic.attendance_writer import AttendanceWriter


class AttendanceState:
    def __init__(self):
        self.is_inside = False
        self.in_time = None
        self.last_seen = None


class AttendanceStateManager:
    def __init__(self, entry_threshold=10, exit_threshold=60):
        self.entry_threshold = entry_threshold
        self.exit_threshold = exit_threshold
        self.states = {}
        self.writer = AttendanceWriter()

    def update(self, tracked_people):
        now = time.time()

        for person_id, person in tracked_people.items():

            if person_id.startswith("UNKNOWN"):
                continue

            if person_id not in self.states:
                self.states[person_id] = AttendanceState()

            state = self.states[person_id]
            state.last_seen = person.last_seen

            # -------- ENTRY --------
            if not state.is_inside and person.seen_duration >= self.entry_threshold:
                state.is_inside = True
                state.in_time = now
                self.writer.mark_in(person)
                print(f"[ATTENDANCE] {person_id} marked IN")

        self._check_exits(now)

    def _check_exits(self, now):
        for person_id, state in self.states.items():
            if state.is_inside and (now - state.last_seen > self.exit_threshold):
                state.is_inside = False
                self.writer.mark_out_by_id(person_id)
                print(f"[ATTENDANCE] {person_id} marked OUT")
