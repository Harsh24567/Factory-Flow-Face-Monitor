# import pickle
# import numpy as np


# class IdentityResolver:
#     def __init__(self, db_path="data/embeddings.pkl", threshold=0.55):
#         with open(db_path, "rb") as f:
#             raw_db = pickle.load(f)

#         # Convert and normalize stored embeddings
#         self.database = {}
#         for person, embeds in raw_db.items():
#             normalized_embeds = []
#             for e in embeds:
#                 e = np.array(e, dtype=np.float32)
#                 e = e / np.linalg.norm(e)
#                 normalized_embeds.append(e)
#             self.database[person] = normalized_embeds

#         self.threshold = threshold

#         print("Loaded identities:", list(self.database.keys()))
#         print("Matching threshold:", self.threshold)

#     def resolve(self, embedding):
#         embedding = np.array(embedding, dtype=np.float32)
#         embedding = embedding / np.linalg.norm(embedding)

#         best_match = "UNKNOWN"
#         best_score = -1.0

#         for person, embeds in self.database.items():
#             for db_emb in embeds:
#                 score = np.dot(embedding, db_emb)

#                 if score > best_score:
#                     best_score = score
#                     best_match = person

# 
#         print(f"Best similarity: {best_score:.3f} → {best_match}")

#         if best_score >= self.threshold:
#             return best_match
#         else:
#             return "UNKNOWN"
import pickle
import numpy as np


class IdentityResolver:
    def __init__(self, db_path="data/embeddings.pkl", threshold=0.60):
        with open(db_path, "rb") as f:
            raw_db = pickle.load(f)

        self.database = {}


        for person, embeds in raw_db.items():
            normalized = []
            for e in embeds:
                e = np.array(e, dtype=np.float32)
                e = e / np.linalg.norm(e)
                normalized.append(e)
            self.database[person] = normalized

        self.threshold = threshold

        print("Loaded identities:", list(self.database.keys()))
        print(f"Matching threshold: {self.threshold} (Factory lighting optimized)")

    def resolve(self, embedding):
        embedding = np.array(embedding, dtype=np.float32)
        embedding = embedding / np.linalg.norm(embedding)

        best_match = "UNKNOWN"
        best_score = -1.0

        for person, embeds in self.database.items():
            for db_emb in embeds:
                score = np.dot(embedding, db_emb)

                if score > best_score:
                    best_score = score
                    best_match = person

        if best_score >= self.threshold:
            return best_match, best_score
        else:
            return "UNKNOWN", best_score
