import time
import math
import uuid


def compute_iou(boxA, boxB):
    """
    box format: (x, y, w, h)
    """
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


def centroid_distance(boxA, boxB):
    cxA = boxA[0] + boxA[2] // 2
    cyA = boxA[1] + boxA[3] // 2
    cxB = boxB[0] + boxB[2] // 2
    cyB = boxB[1] + boxB[3] // 2

    return math.hypot(cxA - cxB, cyA - cyB)


class FaceTracker:
    def __init__(
        self,
        iou_threshold=0.3,
        centroid_threshold=60,
        track_timeout=2.0
    ):
        self.iou_threshold = iou_threshold
        self.centroid_threshold = centroid_threshold
        self.track_timeout = track_timeout

        self.tracks = {}       # track_id -> track_data
        self.track_counter = 0

    def _new_track_id(self):
        self.track_counter += 1
        return f"TRACK_{self.track_counter}"

    def update(self, detections, timestamp=None):
        """
        detections: list of (x, y, w, h)
        returns: list of tracked faces
        """
        if timestamp is None:
            timestamp = time.time()

        updated_tracks = {}
        used_detections = set()

        for track_id, track in self.tracks.items():
            best_match = None
            best_score = 0

            for i, det in enumerate(detections):
                if i in used_detections:
                    continue

                iou = compute_iou(track["bbox"], det)
                if iou >= self.iou_threshold and iou > best_score:
                    best_match = i
                    best_score = iou

            if best_match is None:
                # fallback to centroid distance
                for i, det in enumerate(detections):
                    if i in used_detections:
                        continue

                    dist = centroid_distance(track["bbox"], det)
                    if dist <= self.centroid_threshold:
                        best_match = i
                        break

            if best_match is not None:
                bbox = detections[best_match]
                used_detections.add(best_match)

                updated_tracks[track_id] = {
                    "track_id": track_id,
                    "bbox": bbox,
                    "last_seen": timestamp,
                    "created_at": track["created_at"]
                }
            else:
                if timestamp - track["last_seen"] <= self.track_timeout:
                    updated_tracks[track_id] = track

        for i, det in enumerate(detections):
            if i in used_detections:
                continue

            track_id = self._new_track_id()
            updated_tracks[track_id] = {
                "track_id": track_id,
                "bbox": det,
                "last_seen": timestamp,
                "created_at": timestamp
            }

        self.tracks = {
            tid: t for tid, t in updated_tracks.items()
            if timestamp - t["last_seen"] <= self.track_timeout
        }

        return list(self.tracks.values())
