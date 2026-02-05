import face_recognition
import cv2
import numpy as np
import os

DATASET_PATH = "data/known_faces"  # your future dataset folder

intra = []
inter = []

people = os.listdir(DATASET_PATH)
encodings = {}

print("Encoding real worker images...")

for person in people:
    person_path = os.path.join(DATASET_PATH, person)
    imgs = os.listdir(person_path)[:5]

    person_enc = []
    for img_name in imgs:
        img = cv2.imread(os.path.join(person_path, img_name))
        if img is None:
            continue

        rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        enc = face_recognition.face_encodings(rgb)
        if enc:
            person_enc.append(enc[0])

    if len(person_enc) >= 2:
        encodings[person] = person_enc

print("Calculating distances...")

names = list(encodings.keys())

# Intra
for name in names:
    e = encodings[name]
    for i in range(len(e)-1):
        d = face_recognition.face_distance([e[i]], e[i+1])[0]
        intra.append(d)

# Inter
for i in range(len(names)-1):
    d = face_recognition.face_distance(
        [encodings[names[i]][0]],
        encodings[names[i+1]][0]
    )[0]
    inter.append(d)

print("Intra mean:", np.mean(intra))
print("Inter mean:", np.mean(inter))

threshold = (np.mean(intra) + np.mean(inter)) / 2
print("Suggested threshold:", threshold)
