"""
FastAPI server for Factory Flow Monitor Dashboard
Serves attendance data from the Python tracking system
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from datetime import datetime
from typing import List, Dict, Optional
import uvicorn
import os
import sys
from pathlib import Path

# Add parent directory to path
BASE_DIR = Path(__file__).parent.parent
sys.path.insert(0, str(BASE_DIR))

from api.data_reader import AttendanceDataReader, UnknownPersonTracker

app = FastAPI(
    title="Factory Flow Monitor API",
    description="Real-time attendance monitoring API",
    version="1.0.0"
)

# CORS configuration - allow dashboard to access API
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # Next.js dev server
        "http://localhost:5173",  # Vite dev server
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
        "http://localhost:3001",
        "http://127.0.0.1:3001",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize data readers
data_reader = AttendanceDataReader()
unknown_tracker = UnknownPersonTracker()


@app.get("/")
def read_root():
    """API health check"""
    return {
        "status": "online",
        "service": "Factory Flow Monitor API",
        "version": "1.0.0",
        "timestamp": datetime.now().isoformat()
    }


@app.get("/api/metrics")
def get_metrics():
    """Get real-time metrics for the dashboard"""
    try:
        workers = data_reader.get_registered_workers()
        today_records = data_reader.get_today_records()
        
        # Count present workers today
        present_workers = set()
        for record in today_records:
            # Count if duration > 0 (completed) OR if currently active (ongoing)
            if (record.get('duration_sec', 0) > 0 or record.get('is_active')) and record['person_id'] in workers:
                present_workers.add(record['person_id'])
        
        # Calculate On-Time Percentage
        on_time_count = 0
        total_present_count = len(present_workers)
        
        # Get settings for start time
        settings = data_reader.get_system_settings()
        start_time_limit = datetime.strptime(f"{datetime.now().strftime('%Y-%m-%d')} {settings['work_start_time']}", "%Y-%m-%d %H:%M")

        # CHECK HEARTBEAT
        import json
        import time
        heartbeat_file = BASE_DIR / "data" / "system_heartbeat.json"
        is_system_active = False
        if heartbeat_file.exists():
            try:
                with open(heartbeat_file, "r") as f:
                    hb_data = json.load(f)
                    if time.time() - hb_data.get("timestamp", 0) < 30:
                        is_system_active = True
            except:
                pass

        if not is_system_active:
             # System is offline, so no one is "Live"
             present_workers = set() 
             # We still want to count people who have COMPLETED sessions today as "present" in the total, 
             # but "activePresent" usually implies "currently here". 
             # However, the user said "LIVE PRESENT NOW DATA... STUCK AT 1".
             # If I clear present_workers, it clears "realtimeCount" AND "activePresent" in the return.
             pass


        # Calculate Avg Confidence and On-Time Count
        total_confidence = 0
        confidence_count = 0

        for record in today_records:
            if record['person_id'] in present_workers:
                # On Time Check
                if record['in_time']:
                    in_dt = datetime.strptime(f"{datetime.now().strftime('%Y-%m-%d')} {record['in_time']}", "%Y-%m-%d %H:%M:%S")
                    if in_dt <= start_time_limit:
                        on_time_count += 1
                
                # Confidence Check
                if record.get('confidence', 0) > 0:
                    total_confidence += record['confidence']
                    confidence_count += 1
        
        on_time_percent = int((on_time_count / total_present_count * 100)) if total_present_count > 0 else 0
        avg_conf = int(total_confidence / confidence_count) if confidence_count > 0 else 0

        return {
            "realtimeCount": len(present_workers) if is_system_active else 0, # Only show live count if system is running
            "totalRegistered": len(workers),
            "activePresent": len(present_workers) if is_system_active else 0,
            "unknownDetections": len(unknown_tracker.get_all()),
            "trend": "0",
            "onTimePercentage": on_time_percent,
            "avgConfidence": avg_conf
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/workers")
def get_workers(date: Optional[str] = None):
    """Get all workers with their attendance status"""
    try:
        if date is None:
            date = datetime.now().strftime("%Y-%m-%d")
        
        workers = data_reader.get_registered_workers()
        worker_list = []
        
        # Color palette for avatars
        colors = ["bg-cyan-500", "bg-emerald-500", "bg-amber-500", 
                 "bg-rose-500", "bg-indigo-500", "bg-pink-500", 
                 "bg-purple-500", "bg-blue-500", "bg-green-500"]
        
        for idx, worker_id in enumerate(workers):
            stats = data_reader.get_worker_stats(worker_id, date)
            
            # Format worker data for dashboard
            worker_data = {
                "id": worker_id,
                "name": worker_id.replace("_", " ").title(),  # "Worker_001" -> "Worker 001"
                "department": "Production",  # Default - can be enhanced later
                "status": stats['status'],
                "presenceDuration": stats['total_duration_formatted'],
                "presenceMinutes": stats['total_minutes'],
                "firstSeen": stats['first_seen'] if stats['first_seen'] else "--",
                "lastSeen": stats['last_seen'] if stats['last_seen'] else "--",
                "avatarColor": colors[idx % len(colors)]
            }
            worker_list.append(worker_data)
        
        return worker_list
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/unknown")
def get_unknown_detections():
    """Get unknown person detections"""
    try:
        detections = unknown_tracker.get_all()
        return detections
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/reports/hourly")
def get_hourly_report(date: Optional[str] = None):
    """Get hourly attendance report"""
    try:
        if date is None:
            date = datetime.now().strftime("%Y-%m-%d")
        
        report = data_reader.get_hourly_report(date)
        return report
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/reports/daily")
def get_daily_occupancy(days: int = 30):
    """Get daily occupancy report for the last N days"""
    try:
        return data_reader.get_daily_occupancy(days)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/workers/{worker_id}")
def get_worker_detail(worker_id: str, date: Optional[str] = None):
    """Get detailed stats for a specific worker"""
    try:
        if date is None:
            date = datetime.now().strftime("%Y-%m-%d")
        
        stats = data_reader.get_worker_stats(worker_id, date)
        
        if not stats:
            raise HTTPException(status_code=404, detail="Worker not found")
        
        return stats
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/attendance/raw")
def get_raw_attendance(date: Optional[str] = None):
    """Get raw attendance records (all history if date is None)"""
    try:
        if date is None:
            # Return full history
            records = data_reader.read_attendance_log()
        else:
            all_records = data_reader.read_attendance_log()
            records = [r for r in all_records if r['date'] == date]
        
        return records
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Add endpoint for unknown person snapshot (to be called by tracking system)
@app.post("/api/unknown/add")
def add_unknown_detection(snapshot_path: str, confidence: float = 0.0):
    """Add a new unknown person detection (called by tracking system)"""
    try:
        detection = unknown_tracker.add_detection(snapshot_path, confidence)
        return detection
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.delete("/api/unknown/{detection_id}")
def dismiss_unknown(detection_id: str):
    """Dismiss an unknown person detection"""
    try:
        # Remove from tracker
        unknown_tracker.unknown_detections = [
            d for d in unknown_tracker.unknown_detections 
            if d['id'] != detection_id
        ]
        return {"status": "dismissed", "id": detection_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


from fastapi.responses import FileResponse

@app.get("/api/workers/{worker_id}/image")
def get_worker_image(worker_id: str):
    """Get the registered profile picture for a worker"""
    try:
        worker_dir = BASE_DIR / "data" / "known_faces" / worker_id
        if not worker_dir.exists():
            raise HTTPException(status_code=404, detail="Worker not found")
        
        # Find first image file
        for file in worker_dir.iterdir():
            if file.suffix.lower() in ['.jpg', '.jpeg', '.png']:
                return FileResponse(str(file))
        
        raise HTTPException(status_code=404, detail="Image not found")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ---------------- SETTINGS ENDPOINTS ----------------
from pydantic import BaseModel

class SettingsUpdate(BaseModel):
    key: str
    value: str

@app.get("/api/settings")
def get_settings():
    """Get all system settings"""
    try:
        return data_reader.get_system_settings()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/settings")
def update_settings(setting: SettingsUpdate):
    """Update a system setting"""
    from database.models import SessionLocal, SystemSettings
    db = SessionLocal()
    try:
        # Check if exists
        existing = db.query(SystemSettings).filter(SystemSettings.key == setting.key).first()
        if existing:
            existing.value = setting.value
        else:
            new_setting = SystemSettings(key=setting.key, value=setting.value)
            db.add(new_setting)
        
        db.commit()
        return {"status": "success", "key": setting.key, "value": setting.value}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()


if __name__ == "__main__":
    print("Starting Factory Flow Monitor API Server...")
    print("Dashboard API: http://localhost:8000")
    print("API Docs: http://localhost:8000/docs")
    print("Access from Dashboard: Update NEXT_PUBLIC_API_URL in .env.local")
    print("-" * 60)
    
    uvicorn.run(
        "api.main:app",
        host="0.0.0.0",
        port=8000,
        log_level="info",
        reload=True  # Auto-reload on code changes
    )
