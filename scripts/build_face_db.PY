import os
import pickle
from deepface import DeepFace

DATASET_PATH = "data/known_faces"
DB_PATH = "data/embeddings.pkl"

database = {}

print("\nBuilding face embedding database...\n")

for person in os.listdir(DATASET_PATH):
    person_path = os.path.join(DATASET_PATH, person)

    if not os.path.isdir(person_path):
        continue

    embeddings = []

    for img_name in os.listdir(person_path):
        img_path = os.path.join(person_path, img_name)

        try:
            reps = DeepFace.represent(
                img_path=img_path,
                model_name="ArcFace",
                detector_backend="retinaface",
                enforce_detection=False
            )

            emb = reps[0]["embedding"]
            embeddings.append(emb)

        except Exception as e:
            print(f"Skipped {img_name} ({person})")

    # Only keep people with enough samples
    if len(embeddings) >= 3:
        database[person] = embeddings
        print(f"✅ Encoded {person} ({len(embeddings)} images)")
    else:
        print(f"⚠ Skipped {person} (not enough usable images)")

print("\nSaving database...\n")

with open(DB_PATH, "wb") as f:
    pickle.dump(database, f)

print("🎉 Embedding database created at data/embeddings.pkl")
