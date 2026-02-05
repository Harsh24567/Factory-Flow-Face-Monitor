import time
import numpy as np
import uuid

class TrackedPerson:
    def __init__(self, person_id, embedding):
        import numpy as np
        self.person_id = person_id
        self.embedding = np.array(embedding)

        self.first_seen = time.time()
        self.last_seen = time.time()
        self.seen_duration = 0

        self.is_inside = False
        self.in_time = None
        self.out_time = None

    def update(self, embedding):
        import numpy as np
        self.embedding = np.array(embedding) 
        self.last_seen = time.time()
        self.seen_duration = self.last_seen - self.first_seen


    def update(self, embedding):
        self.embedding = embedding
        self.last_seen = time.time()
        self.seen_duration = self.last_seen - self.first_seen


class PersonTracker:
    def __init__(self, match_threshold=0.6, disappear_time=60):
        self.tracked_people = {}
        self.match_threshold = match_threshold
        self.disappear_time = disappear_time

    def update(self, detections):
        now = time.time()

        for person_id, embedding in detections:
            match_id = self._match_existing(embedding)

            if match_id:
                self.tracked_people[match_id].update(embedding)
            else:
                if person_id == "UNKNOWN":
                    person_id = f"UNKNOWN_{uuid.uuid4().hex[:6]}"
                self.tracked_people[person_id] = TrackedPerson(person_id, embedding)

        self._cleanup(now)
        return self.tracked_people

    def _match_existing(self, embedding):
        import numpy as np
        embedding = np.array(embedding)  # 🔥 FIX

        for pid, person in self.tracked_people.items():
            dist = np.linalg.norm(person.embedding - embedding)
            if dist < self.match_threshold:
                return pid
        return None


    def _cleanup(self, now):
        remove = [pid for pid, p in self.tracked_people.items()
                  if now - p.last_seen > self.disappear_time]
        for pid in remove:
            del self.tracked_people[pid]
