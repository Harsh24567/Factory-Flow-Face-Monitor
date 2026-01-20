import face_recognition
import logging
import numpy as np

logger = logging.getLogger(__name__)

class FaceDetector:
    def detect(self, frame):
        try:
            if frame is None:
                return []

            if not isinstance(frame, np.ndarray):
                return []

            if frame.dtype != np.uint8:
                frame = np.clip(frame, 0, 255).astype(np.uint8)

            if len(frame.shape) == 2:
                frame = cv2.cvtColor(frame, cv2.COLOR_GRAY2RGB)

            elif len(frame.shape) == 3 and frame.shape[2] == 4:
                frame = cv2.cvtColor(frame, cv2.COLOR_BGRA2BGR)

            elif len(frame.shape) != 3 or frame.shape[2] != 3:
                return []

            rgb_frame = frame[:, :, ::-1]

            face_locations = face_recognition.face_locations(
                rgb_frame,
                model="hog"
            )

            return face_locations

        except Exception as e:
            logger.debug(f"Face detection skipped (invalid frame): {e}")
            return []
