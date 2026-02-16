# TESTING PROTOCOL FOR FALSE POSITIVE FIX

## Changes Made

### 1. Threshold Adjustments
- **IdentityResolver**: 0.65 → **0.60** (for factory lighting)
- **face_identifier**: 0.45 → **0.60** (CRITICAL security fix)
- Both now use the same threshold for consistency

### 2. Enhanced Debug Logging
Now when you run `run_system.py`, you'll see detailed confidence scores:

**For recognized workers:**
```
✓ MATCH: Worker_001 (confidence: 0.723, threshold: 0.60)
```

**For unknown persons:**
```
✗ UNKNOWN (best: Worker_001 at 0.543, threshold: 0.60)
```

## Testing Instructions

### Step 1: Restart the System
```cmd
REM Stop current run_system.py (Ctrl+C)
python scripts/run_system.py
```

### Step 2: Test with Yourself (Worker_001)
- Stand in front of the camera
- **Expected**: Should show `Worker_001` with confidence **> 0.60**
- **Watch the console** for the confidence score

### Step 3: Test with Stranger
- Have the stranger stand in front of camera
- **Expected**: Should show `UNKNOWN` with confidence **< 0.60**
- **Critical**: Watch what score the stranger gets. If it's close to 0.60 (like 0.58), that indicates they look similar to Worker_001

### Step 4: Monitor Console Output

**GOOD (Correct Recognition):**
```
✓ MATCH: Worker_001 (confidence: 0.712, threshold: 0.60)
Worker_001 Active: 3.2s
```

**GOOD (Correct Rejection):**
```
✗ UNKNOWN (best: Worker_001 at 0.523, threshold: 0.60)
```

**BAD (False Positive - Should NOT happen now):**
```
✓ MATCH: Worker_001 (confidence: 0.612, threshold: 0.60)  <-- STRANGER identified as Worker_001
```

## If Stranger Still Gets Recognized

If the stranger is still being identified as Worker_001 with confidence > 0.60, it means:

1. **Bad Training Data**: One or more of your 30 training images in `data/known_faces/Worker_001/` might actually be the stranger, not you
2. **Model Confusion**: The stranger genuinely looks very similar to you (same face shape, features)
3. **Need Higher Threshold**: We might need to raise to 0.65 or 0.70

### To Check Training Images
```cmd
explorer data\known_faces\Worker_001
```
Review all 30 images - make sure they're ALL you, not mixed with anyone else.

## If You're Not Being Recognized

If threshold 0.60 is too strict and YOU're not being recognized:

### Option 1: Lower threshold slightly (0.55)
- Edit `identity/identity_resolver.py` line 52
- Edit `recognition/face_identifier.py` line 10
- Change both to `threshold=0.55`

### Option 2: Add more training images
- Take 10-20 more photos of yourself in different lighting
- Add to `data/known_faces/Worker_001/`
- Rebuild embeddings: `python scripts/build_dataset.py`

## Threshold Guide

| Threshold | Security | Factory Lighting | False Positives | False Negatives |
|-----------|----------|------------------|-----------------|-----------------|
| 0.45 | ⚠️ Very Low | ✅ Excellent | ❌ High (DANGEROUS) | ✅ Very Low |
| 0.55 | ⚠️ Low | ✅ Good | ⚠️ Moderate | ✅ Low |
| **0.60** | ✅ **Balanced** | ✅ **Good** | ✅ **Low** | ⚠️ **Moderate** |
| 0.65 | ✅ High | ⚠️ Acceptable | ✅ Very Low | ⚠️ Higher |
| 0.70 | ✅ Very High | ❌ Poor | ✅ Minimal | ❌ High |

**Current Setting: 0.60 (Recommended for Factory)**

## Dashboard Real-Time Update Issue

**Separate Issue**: Dashboard doesn't show real-time updates from camera because:
- Dashboard reads from CSV file
- CSV only updates when person leaves (OUT event)  
- Currently works on 5-second polling from CSV

**To Fix**: Would need WebSocket connection or state polling endpoint - can implement if needed for demo.
