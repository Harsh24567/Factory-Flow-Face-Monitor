import time

class PersonState:
    def __init__(self):
        self.is_in = False
        self.first_seen = None
        self.last_seen = None
        self.in_time = None
        self.out_time = None


class StateTracker:
    def __init__(self):
        self.states = {}

    def get(self, person_id):
        if person_id not in self.states:
            self.states[person_id] = PersonState()
        return self.states[person_id]
