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

            # STRICTER IOU MATCHING LOGIC
            if best_iou > self.iou_threshold:
                track = self.tracked_people[best_track_id]
                existing_id = track.person_id
                
                match_valid = False
                
                # CASE A: Same Identity (or both UNKNOWN) -> MATCH
                if person_id == existing_id:
                    match_valid = True
                    
                # CASE B: Detection is UNKNOWN, Track is KNOWN -> MATCH (assume missed recognition)
                elif person_id == "UNKNOWN" and not existing_id.startswith("UNKNOWN"):
                     # OPTIONAL: Verify embedding similarity to be sure it's not a stranger
                     match_valid = True 

                # CASE C: Detection is KNOWN, Track is UNKNOWN -> UPGRADE (Found identity!)
                elif person_id != "UNKNOWN" and existing_id.startswith("UNKNOWN"):
                    # We found who this "UNKNOWN" person is.
                    # SWAP the track ID to the real name.
                    print(f"!!! UPGRADING TRACK: {existing_id} -> {person_id} !!!")
                    
                    # Create new track with old history
                    new_track = TrackedPerson(person_id, embedding, bbox)
                    new_track.first_seen = track.first_seen
                    new_track.active_duration = track.active_duration
                    new_track.last_seen = now
                    new_track.is_visible = True
                    
                    # Replace in dictionary (removing old, adding new)
                    del self.tracked_people[best_track_id]
                    self.tracked_people[person_id] = new_track
                    
                    used_track_ids.add(person_id)
                    detections[i] = (None, None, None) # Mark handled
                    continue # Skip normal update, we just replaced it

                # CASE D: Detection is KNOWN X, Track is KNOWN Y -> CONFLICT
                elif person_id != "UNKNOWN" and existing_id != "UNKNOWN" and person_id != existing_id:
                    # CRITICAL FIX: explicit identity mismatch.
                    # This means Worker_A is at the spot where Worker_B was.
                    # DO NOT MATCH. Let it create a new track for Worker_A.
                    print(f"!!! CONFLICT DETECTED: Track {existing_id} vs Detection {person_id} (IOU: {best_iou:.2f}) - REJECTING MATCH !!!")
                    match_valid = False
                
                if match_valid:
                    self.tracked_people[best_track_id].update(embedding, bbox)
                    used_track_ids.add(best_track_id)
                    detections[i] = (None, None, None) # Mark handled

        # ---------------- 2. Match by Embedding (Visual) ----------------
        for i, (person_id, embedding, bbox) in enumerate(detections):
            if person_id is None: continue 

            # A. HANDLE KNOWN IDENTITIES
            if person_id != "UNKNOWN":
                # 1. Update existing self
                if person_id in self.tracked_people:
                    self.tracked_people[person_id].update(embedding, bbox)
                    continue
                
                # 2. Try to find a LOST UNKNOWN track to upgrade
                match_id = self._match_existing_embedding(embedding)
                
                if match_id and match_id.startswith("UNKNOWN"):
                    # UPGRADE (Non-spatial, visual re-id)
                    print(f"!!! UPGRADING LOST TRACK: {match_id} -> {person_id} !!!")
                    track = self.tracked_people[match_id]
                    
                    # Create new track with old history
                    new_track = TrackedPerson(person_id, embedding, bbox)
                    new_track.first_seen = track.first_seen
                    new_track.active_duration = track.active_duration
                    new_track.last_seen = now
                    new_track.is_visible = True
                    
                    del self.tracked_people[match_id]
                    self.tracked_people[person_id] = new_track
                    continue
                
                # 3. New Track (Do NOT merge into other Known tracks)
                self.tracked_people[person_id] = TrackedPerson(person_id, embedding, bbox)
                continue

            # B. HANDLE UNKNOWN IDENTITIES
            # Match Existing Unknown via Embedding
            match_id = self._match_existing_embedding(embedding)
            
            # STRICT SECURITY CHECK:
            # If face recognition says UNKNOWN, do NOT allow tracker to merge it into a KNOWN ID.
            if match_id and not match_id.startswith("UNKNOWN"):
                 match_id = None 

            if match_id:
                self.tracked_people[match_id].update(embedding, bbox)
            else:
                # NEW TRACK
                temp_id = f"UNKNOWN_{uuid.uuid4().hex[:6]}"
                self.tracked_people[temp_id] = TrackedPerson(temp_id, embedding, bbox)

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


