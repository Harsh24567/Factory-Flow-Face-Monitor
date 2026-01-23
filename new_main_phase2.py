import cv2
import logging
import time
from pathlib import Path
from datetime import datetime
import threading
import uuid
import sys

from camera.camera_manager import CameraManager
from recognition.encoders.face_encoder import FaceEncoder
from recognition.matchers.face_matcher import FaceMatcher
from recognition.tracking.face_tracker import FaceTracker

from attendance.state.state_tracker import StateTracker
from attendance.logic.in_out_logic import InOutLogic
from attendance.logic.attendance_writer import AttendanceWriter

from database.models import init_db


Path("logs").mkdir(exist_ok=True)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s",
    handlers=[
        logging.FileHandler("logs/face_attendance.log"),
        logging.StreamHandler(sys.stdout)
    ]
)

logger = logging.getLogger(__name__)


DRY_RUN = Path("config/DRY_RUN.flag").exists()
logger.info(f"DRY RUN MODE: {DRY_RUN}")


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
            if frame is not None and frame.size > 0:
                with self.lock:
                    self.frame = frame

    def read(self):
        with self.lock:
            if self.frame is None:
                return None
            return self.frame.copy()

    def stop(self):
        self.running = False
        self.camera.stop()


def main():
    camera_manager = CameraManager()
    camera = CameraThread(camera_manager)

    encoder = FaceEncoder()
    matcher = FaceMatcher(tolerance=0.5)
    matcher.load_known_faces()

    tracker = FaceTracker(max_disappeared=20)

    state_tracker = StateTracker()
    attendance_logic = InOutLogic(in_threshold=1.0, out_threshold=3.0)

    init_db()
    writer = AttendanceWriter(dry_run=DRY_RUN)

    last_heartbeat = 0
    last_face_log = 0

    try:
        camera.start()
        logger.info("Face Attendance System started (Phase 4)")
        logger.info("Waiting for camera feed...")

        # Camera warm-up
        start = time.time()
        while True:
            frame = camera.read()
            if frame is not None:
                logger.info("Camera feed acquired")
                break
            if time.time() - start > 5:
                logger.error("Camera did not provide frames")
                return
            time.sleep(0.05)

        while True:
            frame = camera.read()
            if frame is None:
                continue

            now = time.time()

            if now - last_heartbeat >= 40:
                logger.info("[HEARTBEAT] System running")
                last_heartbeat = now

            tracked_faces = tracker.update(frame)

            seen_person_ids = set()

            # Periodic face count log (10 sec)
            if now - last_face_log >= 10:
                logger.info(f"Faces detected: {len(tracked_faces)}")
                last_face_log = now

            for face in tracked_faces:
                track_id = face["track_id"]
                x, y, w, h = face["bbox"]

                face_crop = frame[y:y+h, x:x+w]
                if face_crop.size == 0:
                    continue

                encoding = encoder.encode(face_crop)

                if encoding is not None:
                    person_id = matcher.match(encoding)
                else:
                    person_id = None

                if person_id is None:
                    person_id = f"UNKNOWN_{track_id}"

                seen_person_ids.add(person_id)

                state = state_tracker.get(person_id)
                event = attendance_logic.update(state, seen_now=True)

                if event == "IN":
                    logger.info(f"{person_id} -> IN")

                # Draw
                color = (0, 255, 0) if not person_id.startswith("UNKNOWN") else (0, 165, 255)
                cv2.rectangle(frame, (x, y), (x + w, y + h), color, 2)
                cv2.putText(
                    frame,
                    person_id,
                    (x, y - 8),
                    cv2.FONT_HERSHEY_SIMPLEX,
                    0.55,
                    color,
                    2
                )

            for person_id, state in list(state_tracker.states.items()):
                if person_id not in seen_person_ids:
                    event = attendance_logic.update(state, seen_now=False)

                    if event == "OUT":
                        duration = state.out_time - state.in_time if state.in_time else 0
                        logger.info(f"{person_id} -> OUT | duration={duration:.1f}s")

                        if not person_id.startswith("UNKNOWN"):
                            writer.write(
                                person_id,
                                datetime.fromtimestamp(state.in_time),
                                datetime.fromtimestamp(state.out_time),
                                None
                            )

                        state_tracker.remove(person_id)

            cv2.imshow("Face Attendance System", frame)
            if cv2.waitKey(1) & 0xFF == 27:
                logger.info("ESC pressed, shutting down")
                break

    except KeyboardInterrupt:
        logger.info("Keyboard interrupt received")

    finally:
        camera.stop()
        cv2.destroyAllWindows()
        logger.info("System shutdown complete")


if __name__ == "__main__":
    main()
