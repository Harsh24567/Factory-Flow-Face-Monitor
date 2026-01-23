import face_recognition
import os
import pickle
import cv2

DATASET_DIR = "data/known_faces"
OUTPUT_FILE = "data/known_encodings.pkl"

def encode_known_faces():
    known_encodings = {}
    total_faces = 0

    print("[INFO] Starting face encoding...")

    for person_name in os.listdir(DATASET_DIR):
        person_path = os.path.join(DATASET_DIR, person_name)

        if not os.path.isdir(person_path):
            continue

        print(f"[INFO] Processing person: {person_name}")
        encodings = []

        for img_name in os.listdir(person_path):
            img_path = os.path.join(person_path, img_name)

            image = cv2.imread(img_path)
            if image is None:
                print(f"[WARN] Could not read image: {img_path}")
                continue

            rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)

            boxes = face_recognition.face_locations(rgb, model="hog")

            if len(boxes) == 0:
                print(f"[WARN] No face found in {img_path}")
                continue

            if len(boxes) > 1:
                print(f"[WARN] Multiple faces found in {img_path}, skipping")
                continue

            encoding = face_recognition.face_encodings(rgb, boxes)[0]
            encodings.append(encoding)
            total_faces += 1

        if encodings:
            known_encodings[person_name] = encodings
            print(f"[OK] {person_name}: {len(encodings)} encodings")
        else:
            print(f"[ERROR] No valid encodings for {person_name}")

    with open(OUTPUT_FILE, "wb") as f:
        pickle.dump(known_encodings, f)

    print(f"\n[SUCCESS] Encoding complete")
    print(f"Total people: {len(known_encodings)}")
    print(f"Total faces encoded: {total_faces}")
    print(f"Saved to: {OUTPUT_FILE}")

if __name__ == "__main__":
    encode_known_faces()
