import os
import pickle
import face_recognition
from tqdm import tqdm
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

DATASET_DIR = "data/known_faces"
OUTPUT_FILE = "data/encodings/known_faces.pkl"


def encode_faces():
    known_encodings = []
    known_names = []

    for person_name in os.listdir(DATASET_DIR):
        person_dir = os.path.join(DATASET_DIR, person_name)

        if not os.path.isdir(person_dir):
            continue

        logger.info(f"Encoding faces for: {person_name}")

        for img_name in tqdm(os.listdir(person_dir)):
            img_path = os.path.join(person_dir, img_name)

            try:
                image = face_recognition.load_image_file(img_path)
                encodings = face_recognition.face_encodings(image)

                if len(encodings) == 0:
                    logger.warning(f"No face found in {img_path}")
                    continue

                known_encodings.append(encodings[0])
                known_names.append(person_name)

            except Exception as e:
                logger.error(f"Failed on {img_path}: {e}")

    os.makedirs(os.path.dirname(OUTPUT_FILE), exist_ok=True)

    with open(OUTPUT_FILE, "wb") as f:
        pickle.dump((known_encodings, known_names), f)

    logger.info(f"Saved {len(known_names)} encodings to {OUTPUT_FILE}")


if __name__ == "__main__":
    encode_faces()
