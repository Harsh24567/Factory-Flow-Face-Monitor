from api.data_reader import AttendanceDataReader
from pathlib import Path
import os

print(f"Current Working Dir: {os.getcwd()}")
reader = AttendanceDataReader()
print(f"Base Path: {reader.base_path}")
print(f"Known Faces Path: {reader.known_faces_path}")
print(f"Exists? {reader.known_faces_path.exists()}")

if reader.known_faces_path.exists():
    print("Contents:")
    for item in reader.known_faces_path.iterdir():
        print(f" - {item.name} (is_dir={item.is_dir()})")

workers = reader.get_registered_workers()
print(f"Workers Found: {workers}")
