# main.py

import cv2
import logging
import time
from pathlib import Path
from datetime import datetime
import threading

from camera.camera_manager import CameraManager
from recognition.detectors.face_detector import FaceDetector
from recognition.encoders.face_encoder import FaceEncoder
from recognition.matchers.face_matcher import FaceMatcher

from attendance.state.state_tracker import StateTracker
from attendance.logic.in_out_logic import InOutLogic
from attendance.logic.attendance_writer import AttendanceWriter

from database.models import init_db

# ---------------- LOGGING ---------------- #
Path("logs").mkdir(exist_ok=True)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s",
    handlers=[
        logging.FileHandler("logs/face_attendance.log"),
        logging.StreamHandler()
    ]
)

logger = logging.getLogger(__name__)

# ---------------- DRY RUN ---------------- #
DRY_RUN = Path("config/DRY_RUN.flag").exists()
logger.info(f"DRY RUN MODE: {DRY_RUN}")

# ---------------- THREADED CAMERA ---------------- #
class CameraThread:
    def __init__(self, camera_manager):
        self.camera = camera_manager
        self.frame = None
        self.running = False
        self.lock = threading.Lock()

    def start(self):
        self.camera.start()
        self.running = True
        threading.Thread(target=self.update, daemon=True).start()

    def update(self):
        while self.running:
            frame = self.camera.read()
            if frame is not None:
                with self.lock:
                    self.frame = frame

    def read(self):
        with self.lock:
            return self.frame

    def stop(self):
        self.running = False
        self.camera.stop()

# ---------------- MAIN ---------------- #
def main():
    camera_manager = CameraManager()
    camera = CameraThread(camera_manager)

    detector = FaceDetector()
    encoder = FaceEncoder()
    matcher = FaceMatcher(tolerance=0.5)

    state_tracker = StateTracker()
    attendance_logic = InOutLogic(in_threshold=5, out_threshold=30)

    matcher.load_known_faces()

    init_db()
    writer = AttendanceWriter(dry_run=DRY_RUN)

    fps_counter = 0
    fps = 0
    fps_start = time.time()

    try:
        camera.start()
        logger.info("Face Attendance System started (Threaded Camera)")

        while True:
            frame = camera.read()
            if frame is None:
                time.sleep(0.01)
                continue

            face_locations = detector.detect(frame)
            face_encodings = encoder.encode(frame, face_locations)

            seen_ids = set()

            for (top, right, bottom, left), encoding in zip(face_locations, face_encodings):
                name, confidence = matcher.match(encoding)

                person_id = name if name != "UNKNOWN" else f"UNKNOWN_{left}_{top}"
                seen_ids.add(person_id)

                state = state_tracker.get(person_id)
                event = attendance_logic.update(state, seen_now=True)

                if event == "IN":
                    logger.info(f"{person_id} -> IN")

                elif event == "OUT":
                    logger.info(f"{person_id} -> OUT")
                    if state.in_time and state.out_time:
                        writer.write(
                            person_id,
                            datetime.fromtimestamp(state.in_time),
                            datetime.fromtimestamp(state.out_time),
                            confidence
                        )

                color = (0, 255, 0) if state.is_in else (0, 0, 255)
                cv2.rectangle(frame, (left, top), (right, bottom), color, 2)
                cv2.putText(
                    frame,
                    person_id,
                    (left, top - 10),
                    cv2.FONT_HERSHEY_SIMPLEX,
                    0.6,
                    color,
                    2
                )

            for person_id, state in state_tracker.states.items():
                if person_id not in seen_ids:
                    event = attendance_logic.update(state, seen_now=False)
                    if event == "OUT" and state.in_time and state.out_time:
                        logger.info(f"{person_id} -> OUT")
                        writer.write(
                            person_id,
                            datetime.fromtimestamp(state.in_time),
                            datetime.fromtimestamp(state.out_time),
                            None
                        )

            # -------- FPS COUNTER -------- #
            fps_counter += 1
            if time.time() - fps_start >= 1:
                fps = fps_counter
                fps_counter = 0
                fps_start = time.time()

            cv2.putText(
                frame,
                f"FPS: {fps}",
                (20, 30),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.8,
                (255, 255, 0),
                2
            )

            cv2.imshow("Face Attendance System", frame)

            if cv2.waitKey(1) & 0xFF == ord("q"):
                break

    except Exception as e:
        logger.exception(f"Fatal error: {e}")

    finally:
        camera.stop()
        cv2.destroyAllWindows()
        logger.info("System shutdown complete")

if __name__ == "__main__":
    main()
