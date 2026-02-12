# import time
# import numpy as np
# import uuid

# class TrackedPerson:
#     def __init__(self, person_id, embedding):
#         import numpy as np
#         self.person_id = person_id
#         self.embedding = np.array(embedding)

#         self.first_seen = time.time()
#         self.last_seen = time.time()
#         self.seen_duration = 0

#         self.is_inside = False
#         self.in_time = None
#         self.out_time = None

#     def update(self, embedding):
#         import numpy as np
#         self.embedding = np.array(embedding) 
#         self.last_seen = time.time()
#         self.seen_duration = self.last_seen - self.first_seen


#     def update(self, embedding):
#         self.embedding = embedding
#         self.last_seen = time.time()
#         self.seen_duration = self.last_seen - self.first_seen


# class PersonTracker:
#     def __init__(self, match_threshold=0.6, disappear_time=60):
#         self.tracked_people = {}
#         self.match_threshold = match_threshold
#         self.disappear_time = disappear_time

#     def update(self, detections):
#         now = time.time()

#         for person_id, embedding in detections:
#             match_id = self._match_existing(embedding)

#             if match_id:
#                 self.tracked_people[match_id].update(embedding)
#             else:
#                 if person_id == "UNKNOWN":
#                     person_id = f"UNKNOWN_{uuid.uuid4().hex[:6]}"
#                 self.tracked_people[person_id] = TrackedPerson(person_id, embedding)

#         self._cleanup(now)
#         return self.tracked_people

#     def _match_existing(self, embedding):
#         import numpy as np
#         embedding = np.array(embedding)

#         for pid, person in self.tracked_people.items():
#             dist = np.linalg.norm(person.embedding - embedding)
#             if dist < self.match_threshold:
#                 return pid
#         return None


#     def _cleanup(self, now):
#         remove = [pid for pid, p in self.tracked_people.items()
#                   if now - p.last_seen > self.disappear_time]
#         for pid in remove:
#             del self.tracked_people[pid]
import time
import numpy as np
import uuid


def compute_iou(boxA, boxB):
    # box: (x, y, w, h) -> convert to (x1, y1, x2, y2)
    xA = max(boxA[0], boxB[0])
    yA = max(boxA[1], boxB[1])
    xB = min(boxA[0] + boxA[2], boxB[0] + boxB[2])
    yB = min(boxA[1] + boxA[3], boxB[1] + boxB[3])

    interW = max(0, xB - xA)
    interH = max(0, yB - yA)
    interArea = interW * interH

    boxAArea = boxA[2] * boxA[3]
    boxBArea = boxB[2] * boxB[3]

    unionArea = boxAArea + boxBArea - interArea

    if unionArea == 0:
        return 0.0

    return interArea / unionArea


class TrackedPerson:
    def __init__(self, person_id, embedding, bbox=None):
        self.person_id = person_id
        
        # Store embedding
        embedding = np.array(embedding, dtype=np.float32)
        self.embedding = embedding / np.linalg.norm(embedding)

        # Store bbox 
        self.bbox = bbox

        self.first_seen = time.time()
        self.last_seen = time.time()
        
        # KEY FIX: "Active" Duration (only updated when visible)
        self.active_duration = 0.0 
        
        # Flag to indicate if seen in THIS current frame
        self.is_visible = True

    def update(self, embedding, bbox=None):
        # Update embedding
        embedding = np.array(embedding, dtype=np.float32)
        self.embedding = embedding / np.linalg.norm(embedding)

        if bbox is not None:
            self.bbox = bbox

        now = time.time()
        time_since_last = now - self.last_seen
        
        # Only add to duration if the gap is small (continuous tracking)
        if time_since_last < 2.0: 
            self.active_duration += time_since_last

        self.last_seen = now
        self.is_visible = True


class PersonTracker:
    def __init__(self, similarity_threshold=0.6, iou_threshold=0.3, disappear_time=5):
        self.tracked_people = {}
        self.similarity_threshold = similarity_threshold
        self.iou_threshold = iou_threshold
        self.disappear_time = disappear_time

    def update(self, detections):
        """
        detections: list of tuples (person_id, embedding, bbox)
        """
        now = time.time()
        
        # 1. RESET VISIBILITY for all existing tracks
        for person in self.tracked_people.values():
            person.is_visible = False

        used_track_ids = set()
        
        # ---------------- 1. Match by IOU (Spatial) ----------------
        for i, (person_id, embedding, bbox) in enumerate(detections):
            best_iou = 0
            best_track_id = None

            for track_id, person in self.tracked_people.items():
                if track_id in used_track_ids:
                    continue
                
                if person.bbox is not None and bbox is not None:
                    iou = compute_iou(person.bbox, bbox)
                    if iou > best_iou:
                        best_iou = iou
                        best_track_id = track_id

            if best_iou > self.iou_threshold:
                # UPGRADE LOGIC: If UNKNOWN -> KNOWN
                if person_id != "UNKNOWN" and best_track_id.startswith("UNKNOWN"):
                    # Swap ID
                    print(f"*** UPGRADING ID: {best_track_id} -> {person_id} ***")
                    person_obj = self.tracked_people.pop(best_track_id)
                    person_obj.person_id = person_id
                    person_obj.update(embedding, bbox)
                    
                    self.tracked_people[person_id] = person_obj
                    used_track_ids.add(person_id)
                else:
                    # Normal Update
                    self.tracked_people[best_track_id].update(embedding, bbox)
                    used_track_ids.add(best_track_id)
                
                detections[i] = (None, None, None) # Mark handled

        # ---------------- 2. Match by Embedding (Visual) ----------------
        for i, (person_id, embedding, bbox) in enumerate(detections):
            if person_id is None: continue 

            # Match Existing Known
            if person_id != "UNKNOWN":
                if person_id in self.tracked_people:
                    self.tracked_people[person_id].update(embedding, bbox)
                    continue
            
            # Match Existing Unknown via Embedding
            match_id = self._match_existing_embedding(embedding)
            if match_id:
                self.tracked_people[match_id].update(embedding, bbox)
            else:
                # NEW TRACK
                if person_id == "UNKNOWN":
                    person_id = f"UNKNOWN_{uuid.uuid4().hex[:6]}"
                
                self.tracked_people[person_id] = TrackedPerson(person_id, embedding, bbox)

        self._cleanup(now)
        return self.tracked_people

    def _match_existing_embedding(self, embedding):
        embedding = np.array(embedding, dtype=np.float32)
        embedding = embedding / np.linalg.norm(embedding)

        best_match = None
        best_score = -1

        for pid, person in self.tracked_people.items():
            score = np.dot(person.embedding, embedding)
            if score > best_score:
                best_score = score
                best_match = pid

        if best_score >= self.similarity_threshold:
            return best_match
        return None

    def _cleanup(self, now):
        remove_ids = [
            pid for pid, person in self.tracked_people.items()
            if now - person.last_seen > self.disappear_time
        ]
        for pid in remove_ids:
            del self.tracked_people[pid]


