
import time
import numpy as np
from tracking.person_tracker import PersonTracker

def test_ghost_swap():
    print("--- Starting Ghost Swap Test ---")
    
    # Setup Tracker
    tracker = PersonTracker(similarity_threshold=0.6, iou_threshold=0.3, disappear_time=5)
    
    # Mock Embeddings (random but consistent for each ID)
    np.random.seed(42)
    embedding_a = np.random.randn(512).astype(np.float32)
    embedding_a /= np.linalg.norm(embedding_a)
    
    embedding_b = np.random.randn(512).astype(np.float32)
    embedding_b /= np.linalg.norm(embedding_b)
    
    # 1. Feed Worker_A
    print("\n[Step 1] Feeding Worker_A...")
    bbox_a = (100, 100, 200, 200) # x, y, w, h
    
    for i in range(5):
        detections = [("Worker_A", embedding_a, bbox_a)]
        tracked = tracker.update(detections)
        print(f"Frame {i}: Tracked keys: {list(tracked.keys())}")
        if "Worker_A" not in tracked:
            print("FAILURE: Worker_A not tracked!")
            return

    # 2. Worker_A Leaves (Employment Gap)
    print("\n[Step 2] Worker_A Leaves (Gap)...")
    for i in range(5): # 5 frames of empty
        tracked = tracker.update([])
        # Worker_A should still correspond to a track_id, but be invisible? 
        # Actually tracked_people keys are IDs.
        # It stays in memory until disappear_time (5s). 
        # We simulate fast loop so time.time() won't advance much unless we sleep,
        # but let's assume valid gap.
    
    # 3. Worker_B Enters at SAME SPOT
    print("\n[Step 3] Worker_B Enters at SAME SPOT...")
    bbox_b = (100, 100, 200, 200) # Same spot
    
    detections = [("Worker_B", embedding_b, bbox_b)]
    tracked = tracker.update(detections)
    print(f"Frame X: Tracked keys: {list(tracked.keys())}")
    
    # CHECK RESULT
    if "Worker_B" in tracked and "Worker_A" in tracked:
        print("SUCCESS: Worker_B detected as new track! (Worker_A still in memory but separate)")
        # Check active duration
        print(f"Worker_B Active: {tracked['Worker_B'].active_duration:.2f}s")
        print(f"Worker_A Active: {tracked['Worker_A'].active_duration:.2f}s")
        
    elif "Worker_B" in tracked and "Worker_A" not in tracked:
         print("SUCCESS: Worker_B detected! (Worker_A timed out or removed)")
         
    elif "Worker_A" in tracked and "Worker_B" not in tracked:
        print("FAILURE! Worker_B was identified as Worker_A (Ghost Track Logic took over!)")
    else:
        print(f"Unknown State: {list(tracked.keys())}")

if __name__ == "__main__":
    test_ghost_swap()
