from deepface import DeepFace
import numpy as np
import os
import pickle

class FaceMatcher:
    def __init__(self, db_path="data/known_faces", threshold=0.6):
        self.db_path = db_path
        self.threshold = threshold

        print("[Matcher] Building embeddings database...")
        self.db = DeepFace.find(
            img_path = np.zeros((100,100,3), dtype=np.uint8),
            db_path = db_path,
            model_name="ArcFace",
            enforce_detection=False,
            detector_backend="retinaface",
            silent=True
        )

    def match(self, frame_face):
        try:
            result = DeepFace.find(
                img_path = frame_face,
                db_path = self.db_path,
                model_name="ArcFace",
                enforce_detection=False,
                detector_backend="retinaface",
                silent=True
            )

            if len(result) > 0 and len(result[0]) > 0:
                identity = os.path.basename(os.path.dirname(result[0]['identity'][0]))
                distance = result[0]['distance'][0]
                return identity, 1 - distance

        except:
            pass

        return f"UNKNOWN", None
