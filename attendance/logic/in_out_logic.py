# attendance/logic/in_out_logic.py

import time

class InOutLogic:
    def __init__(self, in_threshold=5, out_threshold=30):
        self.in_threshold = in_threshold
        self.out_threshold = out_threshold

    def update(self, state, seen_now):
        now = time.time()
        if seen_now:
            state.last_seen = now

            if not state.first_seen:
                state.first_seen = now

            if not state.is_in and (now - state.first_seen >= self.in_threshold):
                state.is_in = True
                state.in_time = now
                return "IN"

        else:
            if state.is_in and state.last_seen:
                if now - state.last_seen >= self.out_threshold:
                    state.is_in = False
                    state.out_time = now
                    state.first_seen = None
                    return "OUT"

        return None
