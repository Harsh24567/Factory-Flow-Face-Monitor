import pickle
import numpy as np
import time

class IdentityResolver:
    def __init__(self, db_path="data/embeddings.pkl", threshold=0.55):
        with open(db_path, "rb") as f:
            self.database = pickle.load(f)

        self.threshold = threshold

        self.track_identities = {}

        self.identity_buffer = {}

    def _cosine(self, a, b):
        return np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))

    def _match_embedding(self, embedding):
        best_match = "UNKNOWN"
        best_score = self.threshold

        for person, embeds in self.database.items():
            for e in embeds:
                score = self._cosine(embedding, e)
                if score > best_score:
                    best_score = score
                    best_match = person

        return best_match

    def resolve(self, track_id, embedding):
        name = self._match_embedding(embedding)

        if track_id not in self.identity_buffer:
            self.identity_buffer[track_id] = []

        buf = self.identity_buffer[track_id]
        buf.append(name)

        if len(buf) > 5:
            buf.pop(0)

        final_name = max(set(buf), key=buf.count)

        self.track_identities[track_id] = final_name
        return final_name

    def remove_track(self, track_id):
        self.track_identities.pop(track_id, None)
        self.identity_buffer.pop(track_id, None)
