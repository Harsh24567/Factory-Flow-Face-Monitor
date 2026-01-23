import time


class PersonTracker:
    """
    Runtime state for a single tracked person.
    This class does NOT decide IN/OUT.
    It only records visibility timing.
    """

    def __init__(self, track_id, person_id, name):
        """
        track_id  : internal tracker ID (centroid / IoU / etc.)
        person_id : known worker ID or UNKNOWN_xxx
        name      : worker name or 'UNKNOWN'
        """
        self.track_id = track_id
        self.person_id = person_id
        self.name = name

        self.first_seen = time.time()
        self.last_seen = self.first_seen

        self.visible_duration = 0.0  # seconds (accumulated)

        # Attendance-related flags (controlled by StateManager)
        self.is_inside = False
        self.in_time = None
        self.out_time = None

    def update_seen(self):
        """
        Call this once per frame when the person is detected.
        """
        now = time.time()

        delta = now - self.last_seen
        if delta > 0:
            self.visible_duration += delta

        self.last_seen = now

    def reset_visibility_timer(self):
        """
        Optional utility:
        Can be used if you want to reset visible duration
        after IN event (not mandatory).
        """
        self.visible_duration = 0.0

    def get_absence_duration(self):
        """
        Returns how long the person has NOT been seen.
        """
        return time.time() - self.last_seen

    def __repr__(self):
        return (
            f"PersonTracker("
            f"id={self.person_id}, "
            f"name={self.name}, "
            f"is_inside={self.is_inside}, "
            f"visible={self.visible_duration:.1f}s)"
        )
