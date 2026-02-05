import pickle
import cv2
import face_recognition
from pathlib import Path

KNOWN_FACES_DIR = Path("data/known_faces")
OUTPUT_DIR = Path("data/encodings")
OUTPUT_FILE = OUTPUT_DIR / "known_faces.pkl"

MODEL = "cnn"
UPSAMPLE = 1


def load_image_safe(path):
    try:
        img = cv2.imread(str(path), cv2.IMREAD_UNCHANGED)
        if img is None:
            return None

        if img.dtype != "uint8":
            img = (img / 256).astype("uint8")

        if len(img.shape) == 2:
            img = cv2.cvtColor(img, cv2.COLOR_GRAY2BGR)

        if img.shape[2] == 4:
            img = cv2.cvtColor(img, cv2.COLOR_BGRA2BGR)

        rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        return rgb

    except Exception:
        return None


def main():
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    known_encodings = []
    known_ids = []

    print("Starting encoding process...\n")

    for person_dir in KNOWN_FACES_DIR.iterdir():
        if not person_dir.is_dir():
            continue

        person_id = person_dir.name
        images = list(person_dir.glob("*.*"))

        print(f"Encoding {person_id} ({len(images)} images)")
        success = 0

        for img_path in images:
            rgb = load_image_safe(img_path)
            if rgb is None:
                continue

            try:
                boxes = face_recognition.face_locations(
                    rgb,
                    number_of_times_to_upsample=UPSAMPLE,
                    model=MODEL
                )

                if not boxes:
                    continue

                encs = face_recognition.face_encodings(rgb, boxes)

                if encs:
                    known_encodings.append(encs[0])
                    known_ids.append(person_id)
                    success += 1

            except Exception:
                continue

        print(f"  ✔ {success}/{len(images)} images encoded\n")

    if not known_encodings:
        raise RuntimeError("No encodings generated. Dataset unsuitable.")

    with open(OUTPUT_FILE, "wb") as f:
        pickle.dump({"encodings": known_encodings, "ids": known_ids}, f)

    print("=" * 50)
    print(f"Encoding complete — {len(known_encodings)} faces saved")
    print("=" * 50)


if __name__ == "__main__":
    main()
