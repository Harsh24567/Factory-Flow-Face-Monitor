# CRITICAL FIX APPLIED
## Face Recognition Threshold Adjustment

### Issue
Stranger was being incorrectly identified as Worker_001 due to threshold being too permissive.

### Change
- **Previous threshold**: 0.45 (too low - accepting 45% similarity)
- **New threshold**: 0.65 (stricter - requires 65% similarity)
- **File**: `recognition/face_identifier.py`

### What This Means
- **0.45**: Dangerous - accepts faces that are only 45% similar → FALSE POSITIVES
- **0.65**: Secure - requires 65% similarity → Better accuracy
- **1.0**: Perfect match (identical)

### Testing Needed
1. Stop your `run_system.py` if running
2. Restart it: `python scripts/run_system.py`
3. Test with yourself (Worker_001) - should still recognize you
4. Test with stranger - should now show as "UNKNOWN"

### If Worker_001 No Longer Recognized
If the new threshold is too strict and you're not being recognized, we can:
- Lower to 0.60 (moderate security)
- Or add more training images of yourself to `data/known_faces/Worker_001/`

### Dashboard Real-Time Updates
The dashboard currently doesn't auto-update from camera feed because:
- API server reads from CSV file
- CSV is only written when person leaves (OUT event)
- Need to add real-time state polling or WebSocket connection

This will be addressed separately from the security fix.
