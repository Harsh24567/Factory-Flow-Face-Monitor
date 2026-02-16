import tensorflow as tf

gpus = tf.config.list_physical_devices('GPU')
if gpus:
    tf.config.experimental.set_memory_growth(gpus[0], True)

import numpy as np
import cv2
import logging
from datetime import datetime
from pathlib import Path
from deepface import DeepFace

from tracking.person_tracker import PersonTracker
from identity.identity_resolver import IdentityResolver
from attendance.state.state_manager import StateManager
from attendance.logic.csv_writer import CSVAttendanceWriter
from tracking.occupancy_counter import OccupancyCounter

# ... (logging setup remains same) ...
logging.basicConfig(level=logging.INFO)

print("Available GPUs:", tf.config.list_physical_devices('GPU'))

# ---------------- INITIALIZATION ----------------
tracker = PersonTracker(similarity_threshold=0.6, iou_threshold=0.3, disappear_time=30) 
resolver = IdentityResolver(threshold=0.60)
writer = CSVAttendanceWriter(file_path="attendance_log.csv")  # Initialize CSV Writer
state_manager = StateManager(in_threshold=10, out_threshold=20)

# ---------------- MOBILE SSD SETUP ----------------
BASE_DIR = Path(__file__).resolve().parent.parent
MODEL_PATH = str(BASE_DIR / "models" / "MobileNetSSD_deploy.caffemodel")
CONFIG_PATH = str(BASE_DIR / "models" / "MobileNetSSD_deploy.prototxt")

occupancy_counter = OccupancyCounter(
    model_path=MODEL_PATH,
    config_path=CONFIG_PATH,
    process_interval=0.0
)

# ---------------- CAMERA ----------------
cap = cv2.VideoCapture(0, cv2.CAP_DSHOW)

if not cap.isOpened():
    raise RuntimeError("Camera not opening")

print("Attendance system running... Press Q to quit")

# ---------------- MAIN LOOP ----------------
while True:
    for _ in range(5):
        cap.grab()
        
    ret, frame = cap.read()
    if not ret:
        continue

    # Debug Info
    cv2.putText(frame, f"Time: {datetime.now().strftime('%H:%M:%S')}", (10, 20), 
                cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 255), 2)

    try:
        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

        # -------- FACE DETECTION --------
        detections = DeepFace.extract_faces(
            img_path=rgb_frame,
            detector_backend="retinaface",
            enforce_detection=False,
            align=False
        )

        people = []

        for face in detections:
            area = face["facial_area"]
            x, y, w, h = area["x"], area["y"], area["w"], area["h"]

            frame_h, frame_w, _ = frame.shape
            if w < 60 or h < 60 or (w > frame_w * 0.9 and h > frame_h * 0.9):
                continue

            face_img = face["face"]

            if isinstance(face_img, tuple):
                face_img = face_img[0]

            if face_img is None:
                continue

            # -------- EMBEDDING --------
            emb = DeepFace.represent(
                img_path=face_img,
                model_name="Facenet512",
                detector_backend="skip",
                enforce_detection=False,
                align=False
            )[0]["embedding"]

            if w < 50 or h < 50:
                continue

            emb = np.array(emb, dtype=np.float32)

            person_id, _ = resolver.resolve(emb)
            people.append((person_id, emb, (x, y, w, h)))

            color = (0, 255, 0) if person_id != "UNKNOWN" else (0, 0, 255)

            cv2.rectangle(frame, (x, y), (x + w, y + h), color, 2)
            cv2.putText(frame, person_id, (x, y - 10),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.8, color, 2)


        tracked = tracker.update(people)
        print("Tracked keys:", list(tracked.keys()))


        for person in tracked.values():
            if not person.person_id.startswith("UNKNOWN"):
                 print(f"{person.person_id} Active: {round(person.active_duration, 1)}s")
            state_manager.process(person, writer)

        inside_count = occupancy_counter.count_people(frame)

        cv2.putText(frame, f"Inside: {inside_count}",
                    (20, 40),
                    cv2.FONT_HERSHEY_SIMPLEX,
                    1,
                    (255, 0, 0),
                    2)

    except Exception as e:
        logging.error(f"Frame processing error: {e}")

    cv2.imshow("Factory Attendance System", frame)

    if cv2.waitKey(1) & 0xFF == ord("q"):
        break

cap.release()
cv2.destroyAllWindows()
