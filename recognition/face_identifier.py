import pickle
import numpy as np

with open("data/embeddings.pkl", "rb") as f:
    DATABASE = pickle.load(f)

def cosine(a, b):
    return np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))

def find_identity(embedding, threshold=0.45):
    best_match = "UNKNOWN"
    best_score = threshold

    for person, embeds in DATABASE.items():
        for e in embeds:
            score = cosine(embedding, e)
            if score > best_score:
                best_score = score
                best_match = person

    return best_match
