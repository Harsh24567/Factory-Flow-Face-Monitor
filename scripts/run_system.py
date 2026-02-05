# import cv2
# import time
# import logging
# import numpy as np
# from deepface import DeepFace

# from tracking.person_tracker import PersonTracker
# from identity.identity_resolver import IdentityResolver
# from attendance.state.state_manager import StateManager
# from attendance.logic.attendance_writer import AttendanceWriter

# logging.basicConfig(level=logging.INFO)

# tracker = PersonTracker()
# resolver = IdentityResolver()
# state_manager = StateManager()
# writer = AttendanceWriter()

# cap = cv2.VideoCapture(0)

# if not cap.isOpened():
#     raise RuntimeError("Camera not opening")

# print("🚀 Attendance system running... Press Q to quit")

# while True:
#     ret, frame = cap.read()
#     if not ret:
#         continue

#     try:
#         detections = DeepFace.extract_faces(
#             img_path=frame,
#             detector_backend="retinaface",
#             enforce_detection=False
#         )

#         people = []

#         for face in detections:
#             area = face["facial_area"]
#             x, y, w, h = area["x"], area["y"], area["w"], area["h"]

#             face_img = face["face"]

#             emb = DeepFace.represent(
#                 img_path=face_img,
#                 model_name="ArcFace",
#                 detector_backend="skip",
#                 enforce_detection=False
#             )[0]["embedding"]

#             track_id = str(id(face_img))
#             person_id = resolver.resolve(track_id, emb)

#             people.append((person_id, emb))

#             # 🟢 DRAW BOUNDING BOX
#             cv2.rectangle(frame, (x, y), (x + w, y + h), (0, 255, 0), 2)
#             cv2.putText(frame, person_id, (x, y - 10),
#                         cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 255, 0), 2)

#         tracked = tracker.update(people)

#         for person in tracked.values():
#             state_manager.process(person, writer)

#     except Exception as e:
#         logging.error(f"Frame processing error: {e}")

#     cv2.imshow("Factory Attendance System", frame)

#     if cv2.waitKey(1) & 0xFF == ord("q"):
#         break

# cap.release()
# cv2.destroyAllWindows()
import cv2
import logging
import numpy as np
from deepface import DeepFace

from tracking.person_tracker import PersonTracker
from identity.identity_resolver import IdentityResolver
from attendance.state.state_manager import StateManager
from attendance.logic.attendance_writer import AttendanceWriter
from attendance.occupancy.occupancy_service import OccupancyService

logging.basicConfig(level=logging.INFO)

tracker = PersonTracker(match_threshold=0.6)
resolver = IdentityResolver()
state_manager = StateManager()
writer = AttendanceWriter()
occupancy = OccupancyService()

cap = cv2.VideoCapture(0)

if not cap.isOpened():
    raise RuntimeError("Camera not opening")

print("Attendance system running... Press Q to quit")

frame_count = 0
PROCESS_EVERY = 3

while True:
    ret, frame = cap.read()
    if not ret:
        continue

    frame = cv2.resize(frame, (640, 480))
    frame_count += 1

    # Skip heavy processing frames
    if frame_count % PROCESS_EVERY != 0:
        cv2.imshow("Factory Attendance System", frame)
        if cv2.waitKey(1) & 0xFF == ord("q"):
            break
        continue

    try:
        detections = DeepFace.extract_faces(
            img_path=frame,
            detector_backend="retinaface",
            enforce_detection=False
        )

        people = []

        for face in detections:
            area = face["facial_area"]
            x, y, w, h = area["x"], area["y"], area["w"], area["h"]

            face_img = face["face"]

            emb = DeepFace.represent(
                img_path=face_img,
                model_name="ArcFace",
                detector_backend="skip",
                enforce_detection=False
            )[0]["embedding"]

            track_id = str(id(face_img))
            person_id = resolver.resolve(track_id, emb)

            people.append((person_id, emb))

            cv2.rectangle(frame, (x, y), (x + w, y + h), (0, 255, 0), 2)
            cv2.putText(frame, person_id, (x, y - 10),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 255, 0), 2)

        # 🔥 TRACKING
        tracked = tracker.update(people)

        # 🔥 ATTENDANCE + UNKNOWN ALERT
        for person in tracked.values():
            if person.person_id.startswith("UNKNOWN") and person.seen_duration > 5:
                logging.warning("⚠ Unknown person lingering!")

            state_manager.process(person, writer)

        # 🔥 LIVE OCCUPANCY DISPLAY
        current_count = occupancy.get_current_count(tracked)
        cv2.putText(frame, f"Inside: {current_count}", (10, 30),
                    cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2)

    except Exception as e:
        logging.error(f"Frame processing error: {e}")

    cv2.imshow("Factory Attendance System", frame)

    if cv2.waitKey(1) & 0xFF == ord("q"):
        break

cap.release()
cv2.destroyAllWindows()
