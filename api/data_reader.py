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
        """Read all attendance records from CSV"""
        records = []
        if not self.csv_path.exists():
            return records
            
        try:
            with open(self.csv_path, 'r', encoding='utf-8') as f:
                reader = csv.DictReader(f)
                for row in reader:
                    if row.get('Person ID'):  # Skip empty rows
                        records.append({
                            'person_id': row['Person ID'],
                            'date': row['Date'],
                            'in_time': row['In Time'],
                            'out_time': row['Out Time'],
                            'duration_sec': float(row['Duration (sec)']) if row['Duration (sec)'] else 0
                        })
        except Exception as e:
            print(f"Error reading CSV: {e}")
            
        return records
    
    def get_today_records(self) -> List[Dict]:
        """Get attendance records for today only"""
        today = datetime.now().strftime("%Y-%m-%d")
        all_records = self.read_attendance_log()
        return [r for r in all_records if r['date'] == today]
    
    def get_worker_stats(self, worker_id: str, date: str = None) -> Dict:
        """Get statistics for a specific worker"""
        if date is None:
            date = datetime.now().strftime("%Y-%m-%d")
            
        all_records = self.read_attendance_log()
        worker_records = [r for r in all_records if r['person_id'] == worker_id and r['date'] == date]
        
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
                'status': 'absent'
            }
        
        total_duration = sum(r['duration_sec'] for r in worker_records)
        first_seen = min(worker_records, key=lambda x: x['in_time'])['in_time']
        last_seen = max(worker_records, key=lambda x: x['out_time'])['out_time']
        
        hours = int(total_duration // 3600)
        minutes = int((total_duration % 3600) // 60)
        
        return {
            'worker_id': worker_id,
            'date': date,
            'total_duration_sec': total_duration,
            'total_duration_formatted': f'{hours}h {minutes}m',
            'total_minutes': int(total_duration / 60),
            'first_seen': first_seen,
            'last_seen': last_seen,
            'num_sessions': len(worker_records),
            'status': 'present' if total_duration > 0 else 'absent'
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
    
    def _calculate_overlap(self, in_time: float, out_time: float, 
                          slot_start: float, slot_end: float) -> int:
        """Calculate overlap in minutes between presence and time slot"""
        overlap_start = max(in_time, slot_start)
        overlap_end = min(out_time, slot_end)
        
        if overlap_start < overlap_end:
            return int((overlap_end - overlap_start) * 60)
        return 0


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
