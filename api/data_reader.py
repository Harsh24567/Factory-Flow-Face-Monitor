"""
Data reader utilities for the API server.
Reads data from CSV logs, state manager, and database.
"""
import csv
import os
import pickle
from datetime import datetime, time as dt_time, timedelta
from pathlib import Path
from typing import List, Dict, Optional
import sys

# Add parent directory to path
BASE_DIR = Path(__file__).parent.parent
sys.path.insert(0, str(BASE_DIR))

from attendance.state.state_manager import StateManager


class AttendanceDataReader:
    """Reads attendance data from various sources"""
    
    def __init__(self, base_path: str = None):
        self.base_path = Path(base_path) if base_path else BASE_DIR
        self.csv_path = self.base_path / "attendance_log.csv"
        self.known_faces_path = self.base_path / "data" / "known_faces"
        self.embeddings_path = self.base_path / "data" / "embeddings.pkl"
        
    def get_registered_workers(self) -> List[str]:
        """Get list of all registered worker IDs from known_faces directory"""
        workers = []
        if self.known_faces_path.exists():
            for item in self.known_faces_path.iterdir():
                if item.is_dir():
                    workers.append(item.name)
        return sorted(workers)
    
    def read_attendance_log(self) -> List[Dict]:
        """Read all attendance records from Database"""
        from database.models import SessionLocal, FaceAttendance
        db = SessionLocal()
        records = []
        try:
            db_records = db.query(FaceAttendance).all()
            for row in db_records:
                records.append({
                    'person_id': row.person_id,
                    'date': row.date.strftime("%Y-%m-%d") if row.date else "",
                    'in_time': row.in_time.strftime("%H:%M:%S") if row.in_time else "",
                    'out_time': row.out_time.strftime("%H:%M:%S") if row.out_time else None,
                    'duration_sec': row.duration_seconds if row.duration_seconds is not None else 0,
                    'confidence': row.confidence if row.confidence else 0.0,
                    'is_active': row.out_time is None # Flag to identify active sessions
                })
        except Exception as e:
            print(f"Error reading DB: {e}")
        finally:
            db.close()
            
        return records
    
    def get_today_records(self) -> List[Dict]:
        """Get attendance records for today only"""
        today = datetime.now().strftime("%Y-%m-%d")
        all_records = self.read_attendance_log()
        return [r for r in all_records if r['date'] == today]
    
    def get_system_settings(self) -> Dict[str, str]:
        """Fetch system settings from database"""
        from database.models import SessionLocal, SystemSettings
        db = SessionLocal()
        settings = {}
        try:
            results = db.query(SystemSettings).all()
            for row in results:
                settings[row.key] = row.value
        except Exception as e:
            print(f"Error fetching settings: {e}")
        finally:
            db.close()
        
        # Defaults
        if "work_start_time" not in settings: settings["work_start_time"] = "09:00"
        if "work_end_time" not in settings: settings["work_end_time"] = "17:00"
        return settings

    def get_worker_stats(self, worker_id: str, date: str = None) -> Dict:
        """Get statistics for a specific worker"""
        if date is None:
            date = datetime.now().strftime("%Y-%m-%d")
            
        all_records = self.read_attendance_log()
        worker_records = [r for r in all_records if r['person_id'] == worker_id and r['date'] == date]
        
        settings = self.get_system_settings()
        start_time_limit = datetime.strptime(f"{date} {settings['work_start_time']}", "%Y-%m-%d %H:%M")
        end_time_limit = datetime.strptime(f"{date} {settings['work_end_time']}", "%Y-%m-%d %H:%M")

        status = 'absent'
        is_late = False
        left_early = False
        
        if not worker_records:
            return {
                'worker_id': worker_id,
                'date': date,
                'total_duration_sec': 0,
                'total_duration_formatted': '0h 0m',
                'total_minutes': 0,
                'first_seen': None,
                'last_seen': None,
                'num_sessions': 0,
                'status': 'absent',
                'is_late': False,
                'left_early': False
            }
        
        total_duration = sum(r['duration_sec'] for r in worker_records)
        first_seen_str = min(worker_records, key=lambda x: x['in_time'])['in_time']
        
        # Handle out_time safely (active sessions have None)
        completed_sessions = [r for r in worker_records if r['out_time']]
        active_sessions = [r for r in worker_records if r['out_time'] is None]
        
        if completed_sessions:
            last_seen_str = max(completed_sessions, key=lambda x: x['out_time'])['out_time']
        elif active_sessions:
            last_seen_str = active_sessions[0]['in_time'] # Use in_time if currently active
        else:
            last_seen_str = first_seen_str # Fallback

        first_seen_dt = datetime.strptime(f"{date} {first_seen_str}", "%Y-%m-%d %H:%M:%S")
        
        # LOGIC: LATE
        if first_seen_dt > start_time_limit:
            is_late = True
            
        # LOGIC: LEFT EARLY
        # If currently active, they haven't left.
        if active_sessions:
            left_early = False
        else:
            try:
                last_seen_dt = datetime.strptime(f"{date} {last_seen_str}", "%Y-%m-%d %H:%M:%S")
                if last_seen_dt < end_time_limit:
                    left_early = True
            except:
                left_early = False
            
        # Refine Status
        if total_duration > 0 or active_sessions:
            status = 'present'
            if is_late: status += ' (Late)'
            if left_early: status += ' (Early Leave)'
            if active_sessions: status += ' (Active)'
        
        hours = int(total_duration // 3600)
        minutes = int((total_duration % 3600) // 60)
        
        return {
            'worker_id': worker_id,
            'date': date,
            'total_duration_sec': total_duration,
            'total_duration_formatted': f'{hours}h {minutes}m',
            'total_minutes': int(total_duration / 60),
            'first_seen': first_seen_str,
            'last_seen': last_seen_str,
            'num_sessions': len(worker_records),
            'status': status,
            'is_late': is_late,
            'left_early': left_early
        }
    
    def get_hourly_report(self, date: str = None) -> List[Dict]:
        """Generate hourly presence report for all workers"""
        if date is None:
            date = datetime.now().strftime("%Y-%m-%d")
            
        workers = self.get_registered_workers()
        all_records = self.read_attendance_log()
        day_records = [r for r in all_records if r['date'] == date]
        
        # Define hourly slots (9 AM to 10 PM)
        time_slots = []
        for hour in range(9, 23):  # 9 AM to 10 PM
            if hour < 12:
                time_slots.append(f"{hour}:00 AM")
            elif hour == 12:
                time_slots.append("12:00 PM")
            else:
                time_slots.append(f"{hour-12}:00 PM")
        
        hourly_data = []
        
        for slot in time_slots:
            slot_data = {'timeSlot': slot, 'data': {}}
            
            # Parse slot time
            slot_hour = self._parse_time_slot(slot)
            slot_end_hour = slot_hour + 1
            
            for worker in workers:
                # Get worker's records for this hour
                worker_records = [r for r in day_records if r['person_id'] == worker]
                
                total_minutes = 0
                for record in worker_records:
                    # Parse in/out times
                    in_time = self._parse_hms(record['in_time'])
                    out_time = self._parse_hms(record['out_time'])
                    
                    if in_time and out_time:
                        # Calculate overlap with this hour slot
                        overlap = self._calculate_overlap(
                            in_time, out_time, slot_hour, slot_end_hour
                        )
                        total_minutes += overlap
                
                # Store result (null if no presence, 0 if absent, minutes if present)
                if total_minutes > 0:
                    slot_data['data'][worker] = total_minutes
                elif any(r['person_id'] == worker for r in day_records):
                    slot_data['data'][worker] = 0
                else:
                    slot_data['data'][worker] = None
            
            hourly_data.append(slot_data)
        
        return hourly_data
    
    def _parse_time_slot(self, slot_str: str) -> int:
        """Parse time slot string to hour (24-hour format)"""
        # e.g., "9:00 AM" -> 9, "2:00 PM" -> 14
        parts = slot_str.split()
        time_part = parts[0].split(':')[0]
        hour = int(time_part)
        
        if 'PM' in slot_str and hour != 12:
            hour += 12
        elif 'AM' in slot_str and hour == 12:
            hour = 0
            
        return hour
    
    def _parse_hms(self, time_str: str) -> Optional[float]:
        """Parse HH:MM:SS to decimal hours"""
        try:
            t = datetime.strptime(time_str, "%H:%M:%S")
            return t.hour + t.minute / 60.0 + t.second / 3600.0
        except:
            return None
    
    def get_daily_occupancy(self, days: int = 30) -> List[Dict]:
        """Get daily unique worker counts for the last N days"""
        all_records = self.read_attendance_log()
        registered_workers = set(self.get_registered_workers())
        
        # Group by date
        daily_counts = {}
        today = datetime.now().date()
        start_date = today - timedelta(days=days)
        
        # Initialize all dates in range with 0
        current = start_date
        while current <= today:
            d_str = current.strftime("%Y-%m-%d")
            daily_counts[d_str] = set()
            current += timedelta(days=1)
            
        for r in all_records:
            date_str = r['date']
            person_id = r['person_id']
            # Only count if within range AND is a registered worker (exclude test data/unknowns)
            if date_str in daily_counts and person_id and person_id in registered_workers:
                daily_counts[date_str].add(person_id)
                
        # Format for frontend
        result = []
        for date_str, workers in daily_counts.items():
            result.append({
                "date": date_str,
                "count": len(workers)
            })
            
        return sorted(result, key=lambda x: x['date'])


class UnknownPersonTracker:
    """Track unknown person detections"""
    
    def __init__(self):
        self.unknown_detections = []
    
    def add_detection(self, snapshot_path: str, confidence: float = 0.0):
        """Add a new unknown person detection"""
        detection = {
            'id': f'UNK-{len(self.unknown_detections) + 1:03d}',
            'timestamp': datetime.now().strftime("%I:%M %p"),
            'snapshot_path': snapshot_path,
            'confidence': int(confidence * 100) if confidence > 0 else 85,
            'location': 'Camera Feed'
        }
        self.unknown_detections.append(detection)
        return detection
    
    def get_all(self) -> List[Dict]:
        """Get all unknown detections"""
        return self.unknown_detections
    
    def clear(self):
        """Clear all detections"""
        self.unknown_detections.clear()
