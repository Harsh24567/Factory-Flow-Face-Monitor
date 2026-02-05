import cv2
import logging
from deepface import DeepFace
from recognition.face_identifier import find_identity

logging.basicConfig(level=logging.INFO)

def main():
    print("Starting Factory Attendance System (Recognition Mode)...")

    cap = cv2.VideoCapture(0)

    if not cap.isOpened():
        print("Camera not found")
        return

    while True:
        ret, frame = cap.read()
        if not ret:
            break

        try:
            detections = DeepFace.extract_faces(
                img_path=frame,
                detector_backend="retinaface",
                enforce_detection=False
            )

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

                name = find_identity(emb)

                cv2.rectangle(frame, (x, y), (x+w, y+h), (0,255,0), 2)
                cv2.putText(frame, name, (x, y-10),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0,255,0), 2)

        except Exception as e:
            logging.error(e)

        cv2.imshow("Factory Attendance System", frame)

        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

    cap.release()
    cv2.destroyAllWindows()

if __name__ == "__main__":
    main()
