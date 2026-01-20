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

    state_tracker = StateTracker()

    attendance_logic = InOutLogic(
        in_threshold=0.5,
        out_threshold=1.5
    )

    init_db()
    writer = AttendanceWriter(dry_run=DRY_RUN)

    face_cascade = cv2.CascadeClassifier(
        cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
    )

    last_heartbeat = 0
    HEARTBEAT_INTERVAL = 40
    active_unknown_id = None

    try:
        camera.start()
        logger.info("Face Attendance System started (Threaded Camera)")
        logger.info("Waiting for camera feed...")

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

            if now - last_heartbeat >= HEARTBEAT_INTERVAL:
                logger.info("[HEARTBEAT] System running")
                last_heartbeat = now

            gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            faces = face_cascade.detectMultiScale(
                gray,
                scaleFactor=1.2,
                minNeighbors=5,
                minSize=(60, 60)
            )

            seen_ids = set()

            if len(faces) > 0:
                if active_unknown_id is None:
                    active_unknown_id = f"UNKNOWN_{uuid.uuid4().hex[:8]}"

                pid = active_unknown_id
                seen_ids.add(pid)

                state = state_tracker.get(pid)
                event = attendance_logic.update(state, seen_now=True)

                if event == "IN":
                    logger.info(f"{pid} -> IN")

                for (x, y, w, h) in faces:
                    cv2.rectangle(
                        frame, (x, y), (x + w, y + h),
                        (0, 255, 0), 2
                    )
                    cv2.putText(
                        frame,
                        pid,
                        (x, y - 10),
                        cv2.FONT_HERSHEY_SIMPLEX,
                        0.6,
                        (0, 255, 255),
                        2
                    )

            for pid, state in list(state_tracker.states.items()):
                if pid not in seen_ids:
                    event = attendance_logic.update(state, seen_now=False)
                    if event == "OUT":
                        logger.info(f"{pid} -> OUT")
                        active_unknown_id = None

                        if state.in_time and state.out_time:
                            writer.write(
                                pid,
                                datetime.fromtimestamp(state.in_time),
                                datetime.fromtimestamp(state.out_time),
                                None
                            )

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
