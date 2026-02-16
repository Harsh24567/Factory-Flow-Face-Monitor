# CRITICAL BUG FIXED - UPGRADE LOGIC REMOVED

## The Bug
Found in `tracking/person_tracker.py` lines 171-180:

```python
# DANGEROUS CODE (NOW REMOVED):
if person_id != "UNKNOWN" and best_track_id.startswith("UNKNOWN"):
    # Swap ID
    print(f"*** UPGRADING ID: {best_track_id} -> {person_id} ***")
    person_obj = self.tracked_people.pop(best_track_id)
    person_obj.person_id = person_id  # ← BYPASSES FACE RECOGNITION!
```

## What Was Happening

1. **You (Worker_001)** stand in camera → Correctly identified → Tracked
2. **You leave** → Track still exists for 5 seconds
3. **Stranger enters SAME LOCATION** → IOU match found
4. **System UPGRADES stranger to Worker_001** ← **BUG**

The system was using **bounding box overlap (IOU)** to "upgrade" unknown persons to known workers, **completely bypassing face recognition**.

## The Fix

Removed the upgrade logic entirely. Now:
- Face recognition result is **ALWAYS respected**
- If face says UNKNOWN → stays UNKNOWN
- If face says Worker_001 → becomes Worker_001
- No spatial location can override identity

## Testing Now

Restart your system:
```cmd
python scripts/run_system.py
```

**Expected Behavior**:
- You → Correctly identified as Worker_001
- Stranger → Stays as UNKNOWN_xxxxxx (no upgrade!)
- Console will NOT show "*** UPGRADING ID ***" message anymore

## Why This Bug Existed

The upgrade logic was likely intended to handle cases where:
- Camera briefly loses face detection
- Person reappears in same spot
- Should maintain same track ID

But it was **too aggressive** and assumed spatial proximity = same person, which is wrong in a factory where multiple people can stand in the same location.

## The Correct Approach

Identity should ONLY come from face recognition (IdentityResolver), which:
- Uses cosine similarity on face embeddings
- Requires 0.60 threshold  
- Never upgrades based on location alone
