import argparse
import datetime
from database.models import SessionLocal, FaceAttendance, Worker  # Worker = registered employees


def parse_args():
    parser = argparse.ArgumentParser(description="Generate hourly attendance report")
    parser.add_argument("--date", required=True, help="Date (YYYY-MM-DD)")
    parser.add_argument("--hour", required=True, type=int, help="Hour (0-23)")
    return parser.parse_args()


def generate_report(report_date, hour):
    window_start = datetime.datetime.combine(
        report_date,
        datetime.time(hour=hour, minute=0, second=0)
    )
    window_end = window_start + datetime.timedelta(hours=1)

    db = SessionLocal()

    try:
        workers = db.query(Worker).all()
        worker_ids = {w.id: w.name for w in workers}

        sessions = (
            db.query(FaceAttendance)
            .filter(FaceAttendance.in_time < window_end)
            .filter(FaceAttendance.out_time > window_start)
            .all()
        )

        present_ids = set()
        unknown_sessions = []

        for s in sessions:
            if s.person_id.startswith("UNKNOWN"):
                unknown_sessions.append(s)
            else:
                present_ids.add(s.person_id)

        present = [(wid, worker_ids[wid]) for wid in present_ids]
        absent = [
            (wid, name)
            for wid, name in worker_ids.items()
            if wid not in present_ids
        ]

        # ---------------- REPORT OUTPUT ----------------
        print("=" * 50)
        print(f"HOURLY ATTENDANCE REPORT")
        print(f"Time Window : {window_start} → {window_end}")
        print("=" * 50)

        print(f"\nTotal Registered Workers: {len(worker_ids)}")

        print(f"\nPresent ({len(present)}):")
        for wid, name in present:
            print(f"  - {wid} | {name}")

        print(f"\nAbsent ({len(absent)}):")
        for wid, name in absent:
            print(f"  - {wid} | {name}")

        if unknown_sessions:
            print(f"\nUnknown Persons:")
            for u in unknown_sessions:
                print(
                    f"  - UNKNOWN | "
                    f"{u.in_time.strftime('%H:%M:%S')} → "
                    f"{u.out_time.strftime('%H:%M:%S')}"
                )

        print("\n" + "=" * 50)

    finally:
        db.close()


if __name__ == "__main__":
    args = parse_args()
    date_obj = datetime.datetime.strptime(args.date, "%Y-%m-%d").date()
    generate_report(date_obj, args.hour)
