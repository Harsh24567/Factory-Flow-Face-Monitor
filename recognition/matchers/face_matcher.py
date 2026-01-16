# recognition/matchers/face_matcher.py

import face_recognition
import logging
import numpy as np
import pickle
import os

logger = logging.getLogger(__name__)

class FaceMatcher:
    def __init__(self, tolerance=0.5, encoding_path="data/encodings/known_faces.pkl"):
        self.known_encodings = []
        self.known_names = []
        self.tolerance = tolerance
        self.encoding_path = encoding_path

    def load_known_faces(self):
        if not os.path.exists(self.encoding_path):
            logger.warning("No known face encodings found. Running in UNKNOWN-only mode.")
            return

        try:
            with open(self.encoding_path, "rb") as f:
                self.known_encodings, self.known_names = pickle.load(f)

            logger.info(f"Loaded {len(self.known_names)} known face encodings")

        except Exception as e:
            logger.error(f"Failed to load encodings: {e}")

    def match(self, face_encoding):
        if not self.known_encodings:
            return "UNKNOWN", None

        distances = face_recognition.face_distance(
            self.known_encodings,
            face_encoding
        )

        best_idx = np.argmin(distances)
        if distances[best_idx] <= self.tolerance:
            return self.known_names[best_idx], distances[best_idx]

        return "UNKNOWN", distances[best_idx]
