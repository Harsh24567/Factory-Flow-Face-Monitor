import uuid
import numpy as np
import face_recognition


class IdentityResolver:
    def __init__(self, known_encodings, tolerance=0.5):
        """
        known_encodings:
            dict[str, list[np.ndarray]]
            {
              "Harsh": [enc1, enc2, ...],
              "Rahul": [...]
            }
        """
        self.known_encodings = known_encodings
        self.tolerance = tolerance

        self.track_identities = {}

    def resolve(self, track_id, face_image, timestamp):
        """
        face_image: RGB cropped face image (numpy array)
        Returns: person_id (KNOWN_xxx or UNKNOWN_xxx)
        """

        if track_id in self.track_identities:
            return self.track_identities[track_id]["person_id"]

        encodings = face_recognition.face_encodings(face_image)

        if not encodings:
            person_id = f"UNKNOWN_{uuid.uuid4().hex[:6]}"
        else:
            encoding = encodings[0]
            person_id = self._match_known(encoding)

        self.track_identities[track_id] = {
            "person_id": person_id,
            "resolved_at": timestamp
        }

        return person_id

    def _match_known(self, encoding):
        """
        Returns KNOWN_<name> or UNKNOWN_<id>
        """
        for name, known_list in self.known_encodings.items():
            distances = face_recognition.face_distance(
                known_list, encoding
            )
            if np.any(distances <= self.tolerance):
                return f"KNOWN_{name}"

        return f"UNKNOWN_{uuid.uuid4().hex[:6]}"

    def remove_track(self, track_id):
        """
        Call when a track expires
        """
        if track_id in self.track_identities:
            del self.track_identities[track_id]
