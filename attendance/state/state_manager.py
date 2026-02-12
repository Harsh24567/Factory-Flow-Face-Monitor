import time
from datetime import datetime

class StateManager:
    def __init__(self, in_threshold=10, out_threshold=20):
        self.in_threshold = in_threshold
        self.out_threshold = out_threshold
        self.states = {}

    def process(self, person, writer):
        """
        person: TrackedPerson object
        writer: CSVAttendanceWriter
        """
        current_time = time.time()
        person_id = person.person_id

        # Skip UNKNOWN for attendance
        if person_id.startswith("UNKNOWN"):
            return

        # Initialize state if not exists
        if person_id not in self.states:
            self.states[person_id] = {
                "state": "SEARCHING", # SEARCHING (Not seen yet), IN (Present)
                "in_time": None
            }

        data = self.states[person_id]
        state = data["state"]

        # Only count duration if person is actively visible in this frame
        active_time = person.active_duration
        is_gone = (current_time - person.last_seen) > 2.0

        # --- LOGIC STATE MACHINE ---

        # 1. ENTRY LOGIC
        if state == "SEARCHING":
            # If they have been active/seen for threshold duration
            if active_time >= self.in_threshold:
                in_dt = datetime.now()
                self.states[person_id] = {
                    "state": "IN",
                    "in_time": in_dt
                }
                print(f"✅ [IN] {person_id} detected! (Present for {active_time:.1f}s)")
                # Ideally we want to log 'IN' to database here if needed, 
                # but user asked for "duration" which is usually end-of-shift.
                # If we assume 'daily log', we just keep state.

        # 2. EXIT LOGIC
        elif state == "IN":
            # If they are gone for > out_threshold
            time_gone = current_time - person.last_seen
            
            if time_gone >= self.out_threshold:
                out_dt = datetime.now()
                in_dt = data["in_time"]
                
                # Calculate total session duration
                session_duration = (out_dt - in_dt).total_seconds()
                
                print(f"❌ [OUT] {person_id} (Gone for {time_gone:.1f}s) | Duration: {session_duration:.1f}s")
                
                # Log to CSV
                if hasattr(writer, 'log_record'):
                    writer.log_record(person_id, in_dt, out_dt, session_duration)
                
                # Reset state
                self.states[person_id] = {
                    "state": "SEARCHING",
                    "in_time": None
                }
                # Reset tracker duration so they can "Re-Enter" fresh logic
                person.active_duration = 0 
