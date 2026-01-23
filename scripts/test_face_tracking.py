import cv2
import time
from tracking.face_tracker import FaceTracker

face_cascade = cv2.CascadeClassifier(
    cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
)

tracker = FaceTracker()

cap = cv2.VideoCapture(0)

print("[INFO] Starting tracking test. Press ESC to exit.")

while True:
    ret, frame = cap.read()
    if not ret:
        continue

    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)

    faces = face_cascade.detectMultiScale(
        gray,
        scaleFactor=1.2,
        minNeighbors=5,
        minSize=(60, 60)
    )

    detections = [(x, y, w, h) for (x, y, w, h) in faces]

    tracked_faces = tracker.update(detections, time.time())

    for t in tracked_faces:
        x, y, w, h = t["bbox"]
        track_id = t["track_id"]

        cv2.rectangle(frame, (x, y), (x + w, y + h), (0, 255, 0), 2)
        cv2.putText(
            frame,
            track_id,
            (x, y - 10),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.6,
            (0, 255, 255),
            2
        )

    cv2.imshow("Phase 2 - Face Tracking", frame)

    if cv2.waitKey(1) & 0xFF == 27:
        break

cap.release()
cv2.destroyAllWindows()
