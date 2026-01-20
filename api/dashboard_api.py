from flask import Flask, jsonify, request
from database.models import SessionLocal, FaceAttendance
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)

app = Flask(__name__)

@app.route('/api/attendance', methods=['GET'])
def get_attendance():
    db = SessionLocal()
    try:
        records = db.query(FaceAttendance).all()
        result = []
        for record in records:
            result.append({
                'id': record.id,
                'person_id': record.person_id,
                'in_time': record.in_time.isoformat() if record.in_time else None,
                'out_time': record.out_time.isoformat() if record.out_time else None,
                'duration_seconds': record.duration_seconds,
                'confidence': record.confidence
            })
        return jsonify(result)
    except Exception as e:
        logger.error(f"API error: {e}")
        return jsonify({'error': str(e)}), 500
    finally:
        db.close()

@app.route('/api/attendance/today', methods=['GET'])
def get_today_attendance():
    db = SessionLocal()
    try:
        today = datetime.now().date()
        records = db.query(FaceAttendance).filter(
            FaceAttendance.date == today
        ).all()
        
        result = []
        for record in records:
            result.append({
                'id': record.id,
                'person_id': record.person_id,
                'in_time': record.in_time.isoformat() if record.in_time else None,
                'out_time': record.out_time.isoformat() if record.out_time else None,
                'duration_seconds': record.duration_seconds,
                'confidence': record.confidence
            })
        return jsonify(result)
    except Exception as e:
        logger.error(f"API error: {e}")
        return jsonify({'error': str(e)}), 500
    finally:
        db.close()

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)