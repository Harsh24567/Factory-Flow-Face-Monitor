import face_recognition
import logging

logger = logging.getLogger(__name__)

class FaceDetector:
    def detect(self, frame):
        try:
            rgb_frame = frame[:, :, ::-1]
            face_locations = face_recognition.face_locations(
                rgb_frame,
                model="hog"  # CPU-safe, stable
            )
            return face_locations
        except Exception as e:
            logger.error(f"Face detection error: {e}")
            return []
