# recognition/encoders/face_encoder.py

import face_recognition
import logging

logger = logging.getLogger(__name__)

class FaceEncoder:
    def encode(self, frame, face_locations):
        try:
            rgb_frame = frame[:, :, ::-1]
            encodings = face_recognition.face_encodings(
                rgb_frame,
                face_locations
            )
            return encodings
        except Exception as e:
            logger.error(f"Face encoding error: {e}")
            return []
